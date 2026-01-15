import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createAuthedClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    }
  );
}

async function createServiceClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    }
  );
}

type Payload = {
  mode: "create" | "update";
  id?: string;
  projectData: Record<string, any>;
};

export async function POST(req: NextRequest) {
  try {
    const authed = await createAuthedClient();
    const { data: userRes, error: userErr } = await authed.auth.getUser();
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = await createServiceClient();
    const { data: profile, error: profileErr } = await service
      .from("profiles")
      .select("is_admin")
      .eq("id", userRes.user.id)
      .single();

    if (profileErr || !profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as Payload;
    if (!body?.mode || !body.projectData) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (body.mode === "update") {
      if (!body.id) {
        return NextResponse.json(
          { error: "Missing id for update" },
          { status: 400 }
        );
      }
      const { data, error } = await service
        .from("project_rounds")
        .update(body.projectData)
        .eq("id", body.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ data }, { status: 200 });
    }

    const { data, error } = await service
      .from("project_rounds")
      .insert([body.projectData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}


