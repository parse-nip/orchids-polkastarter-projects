import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nacl from 'tweetnacl'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY!

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature-ed25519')
    const timestamp = request.headers.get('x-signature-timestamp')
    const rawBody = await request.text()

    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
    }

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, 'hex'),
      Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
    )

    if (!isVerified) {
      return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    
    if (body.type === 1) {
      return NextResponse.json({ type: 1 })
    }
    
    if (body.type === 3) {
      const customId = body.data?.custom_id
      const [action, userId] = customId?.split('_') || []
      
      if (!userId || !['approve', 'deny'].includes(action)) {
        return NextResponse.json({ type: 4, data: { content: 'Invalid interaction', flags: 64 } })
      }

      const approved = action === 'approve'
      
      const { error } = await supabase
        .from('profiles')
        .update({ approved })
        .eq('id', userId)

      if (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ 
          type: 4, 
          data: { content: `Error: ${error.message}`, flags: 64 } 
        })
      }

      const interactionToken = body.token
      const applicationId = body.application_id
      const messageId = body.message?.id
      const channelId = body.channel_id

      if (messageId && channelId) {
        await fetch(
          `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              embeds: body.message?.embeds?.map((embed: Record<string, unknown>) => ({
                ...embed,
                color: approved ? 0x57F287 : 0xED4245,
                footer: {
                  text: `${approved ? 'Approved' : 'Denied'} by ${body.member?.user?.username || 'Admin'}`,
                },
              })),
              components: [],
            }),
          }
        )
      }

      return NextResponse.json({
        type: 4,
        data: {
          content: `User ${approved ? 'approved' : 'denied'} successfully.`,
          flags: 64,
        },
      })
    }

    return NextResponse.json({ type: 1 })
  } catch (error) {
    console.error('Discord interaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
