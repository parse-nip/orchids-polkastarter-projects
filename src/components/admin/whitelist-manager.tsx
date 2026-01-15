"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PROJECT_CAPITAL_ABI } from '@/lib/contracts/ProjectCapital';
import { parseEther } from 'viem';

interface WhitelistMember {
  id?: string;
  wallet_address: string;
  min_investment: number;
  max_investment: number;
}

interface WhitelistManagerProps {
  projectId: string;
  projectName: string;
  contractAddress?: string;
  onClose: () => void;
  defaultMinInvestment?: number;
  defaultMaxInvestment?: number;
}

export default function WhitelistManager({ 
  projectId, 
  projectName, 
  contractAddress,
  onClose,
  defaultMinInvestment = 0,
  defaultMaxInvestment = 1000
}: WhitelistManagerProps) {
  const [members, setMembers] = useState<WhitelistMember[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [minAlloc, setMinAlloc] = useState(String(defaultMinInvestment));
  const [maxAlloc, setMaxAlloc] = useState(String(defaultMaxInvestment));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isWhitelistRequired, setIsWhitelistRequired] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [supabase] = useState(() => createClient());

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const [settingsRes, whitelistRes] = await Promise.all([
        supabase
          .from('project_rounds')
          .select('is_whitelist_required, default_min_investment, default_max_investment')
          .eq('id', projectId)
          .single(),
        supabase
          .from('project_whitelists')
          .select('id, wallet_address, min_investment, max_investment')
          .eq('project_id', projectId)
      ]);
      
      if (settingsRes.error) throw settingsRes.error;
      if (whitelistRes.error) throw whitelistRes.error;

      setIsWhitelistRequired(settingsRes.data?.is_whitelist_required ?? true);
      // Update the min/max alloc from project defaults if they exist
      if (settingsRes.data?.default_min_investment != null) {
        setMinAlloc(String(settingsRes.data.default_min_investment));
      }
      if (settingsRes.data?.default_max_investment != null) {
        setMaxAlloc(String(settingsRes.data.default_max_investment));
      }
      setMembers(whitelistRes.data || []);
    } catch (err) {
      console.error('[WL] Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Successfully synced with blockchain!');
    }
    if (writeError) {
      toast.error('Blockchain sync failed');
    }
  }, [isConfirmed, writeError]);

  const toggleWhitelistRequirement = async () => {
    try {
      const newValue = !isWhitelistRequired;
      setIsWhitelistRequired(newValue);
      const { error } = await supabase
        .from('project_rounds')
        .update({ is_whitelist_required: newValue })
        .eq('id', projectId);
      
      if (error) {
        toast.error('Failed to update settings');
        setIsWhitelistRequired(!newValue);
      } else {
        toast.success(`Whitelist is now ${newValue ? 'required' : 'disabled'}`);
      }
    } catch (err) {
      toast.error('Error updating settings');
    }
  };

  const handleAddMember = async () => {
    const cleanAddress = newAddress.trim().toLowerCase();
    if (!cleanAddress.startsWith('0x') || cleanAddress.length !== 42) {
      toast.error('Invalid wallet address');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('project_whitelists')
        .upsert({
          project_id: projectId,
          wallet_address: cleanAddress,
          min_investment: Number(minAlloc),
          max_investment: Number(maxAlloc)
        }, {
          onConflict: 'project_id,wallet_address'
        })
        .select('id, wallet_address, min_investment, max_investment')
        .single();

      if (error) {
        toast.error('Failed to add member');
      } else if (data) {
        setMembers(prev => {
          const filtered = prev.filter(m => m.wallet_address.toLowerCase() !== cleanAddress);
          return [...filtered, data];
        });
        setNewAddress('');
        toast.success('Member added');
      }
    } catch (err) {
      toast.error('System error adding member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (address: string) => {
    const cleanAddress = address.toLowerCase();
    try {
      const { error } = await supabase
        .from('project_whitelists')
        .delete()
        .eq('project_id', projectId)
        .eq('wallet_address', cleanAddress);

      if (error) {
        toast.error('Failed to remove member');
      } else {
        setMembers(prev => prev.filter(m => m.wallet_address.toLowerCase() !== cleanAddress));
        toast.success('Member removed');
      }
    } catch (err) {
      toast.error('Error removing member');
    }
  };

  const applyRule = async (rule: 'approved' | 'inner_circle') => {
    setIsLoading(true);
    try {
      let profilesQuery = supabase.from('profiles').select('id');
      if (rule === 'approved') profilesQuery = profilesQuery.eq('approved', true);
      if (rule === 'inner_circle') profilesQuery = profilesQuery.eq('has_inner_circle_role', true);

      const { data: profiles } = await profilesQuery;
      if (!profiles || profiles.length === 0) {
        toast.error('No matching profiles');
        return;
      }

      const { data: wallets } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .in('user_id', profiles.map(p => p.id));

      if (!wallets || wallets.length === 0) {
        toast.error('No wallets found');
        return;
      }

      const addresses = [...new Set(wallets.map(w => w.wallet_address?.toLowerCase()).filter(Boolean))];
      const newMembers = addresses.map(addr => ({
        project_id: projectId,
        wallet_address: addr,
        min_investment: Number(minAlloc),
        max_investment: Number(maxAlloc)
      }));

      const { error } = await supabase.from('project_whitelists').upsert(newMembers, {
        onConflict: 'project_id,wallet_address'
      });
      if (error) throw error;
      
      toast.success(`Added ${newMembers.length} members`);
      await fetchData();
    } catch (err) {
      toast.error('Rule application failed');
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithBlockchain = async () => {
    if (!contractAddress || members.length === 0) {
      toast.error('Missing contract or members');
      return;
    }

    try {
      const batch = members.slice(0, 150);
      const addresses = batch.map(m => m.wallet_address as `0x${string}`);
      const mins = batch.map(m => parseEther((m.min_investment ?? 0).toString()));
      const maxs = batch.map(m => parseEther((m.max_investment ?? 0).toString()));

      writeContract({
        address: contractAddress as `0x${string}`,
        abi: PROJECT_CAPITAL_ABI,
        functionName: 'whitelistUsers',
        args: [addresses, mins, maxs],
      });
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const filteredMembers = members.filter(m => 
    m.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Manage Whitelist</h3>
            <p className="text-sm text-slate-400 font-medium">{projectName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isWhitelistRequired ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {isWhitelistRequired ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Whitelist Enforcement</h4>
                <p className="text-xs text-slate-400 font-medium">Toggle if whitelist is mandatory for participation.</p>
              </div>
            </div>
            <Button variant={isWhitelistRequired ? "outline" : "default"} onClick={toggleWhitelistRequirement}>
              {isWhitelistRequired ? "Disable" : "Enable"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-l-4 border-slate-900 pl-3 uppercase">Add Manually</h4>
                <div className="space-y-4">
                  <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="0x..." className="rounded-xl h-12" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="number" value={minAlloc} onChange={(e) => setMinAlloc(e.target.value)} placeholder="Min" className="rounded-xl h-12" />
                    <Input type="number" value={maxAlloc} onChange={(e) => setMaxAlloc(e.target.value)} placeholder="Max" className="rounded-xl h-12" />
                  </div>
                  <Button onClick={handleAddMember} disabled={isSaving} className="w-full h-12 rounded-xl bg-slate-900">Add Member</Button>
                </div>
              </div>
              <div className="space-y-3">
                <Button variant="outline" onClick={() => applyRule('approved')} disabled={isLoading} className="w-full h-12 rounded-xl">Add Approved Members</Button>
                <Button variant="outline" onClick={() => applyRule('inner_circle')} disabled={isLoading} className="w-full h-12 rounded-xl">Add Inner Circle</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900">List ({members.length})</h4>
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 w-32 text-xs" />
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                {filteredMembers.map(m => (
                  <div key={m.wallet_address} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <div className="font-mono text-[11px] font-bold">{m.wallet_address.slice(0, 8)}...{m.wallet_address.slice(-6)}</div>
                      <div className="text-[10px] text-slate-400">Min: {m.min_investment} | Max: {m.max_investment}</div>
                    </div>
                    <button onClick={() => handleRemoveMember(m.wallet_address)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-8">Close</Button>
          <Button disabled={!contractAddress || isConfirming} onClick={syncWithBlockchain} className="rounded-xl px-10 bg-slate-900">
            {isConfirming ? "Syncing..." : "Sync to Blockchain"}
          </Button>
        </div>
      </div>
    </div>
  );
}
