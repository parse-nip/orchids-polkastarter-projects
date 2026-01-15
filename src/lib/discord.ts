const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DISCORD_INNER_CIRCLE_ROLE_ID = process.env.DISCORD_INNER_CIRCLE_ROLE_ID;

// Validate environment variables
if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !DISCORD_CHANNEL_ID || !DISCORD_INNER_CIRCLE_ROLE_ID) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required Discord environment variables');
  } else {
    console.warn('Missing Discord environment variables. Discord functionality will be limited.');
  }
}

export async function checkUserHasInnerCircleRole(discordId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch guild member:', response.status);
      return false;
    }

    const member = await response.json();
    return member.roles?.includes(DISCORD_INNER_CIRCLE_ROLE_ID) ?? false;
  } catch (error) {
    console.error('Error checking Discord role:', error);
    return false;
  }
}

export async function sendApprovalMessage(
  userId: string,
  discordId: string,
  discordUsername: string,
  email: string,
  ddData?: {
    referral: string;
    twitter: string;
    yearsExperience: string;
    averageInvestment: string;
    aboutSelf: string;
    country: string;
  }
): Promise<boolean> {
  try {
    const fields = [
      { name: 'Discord User', value: `<@${discordId}> (${discordUsername})`, inline: true },
      { name: 'Email', value: email || 'Not provided', inline: true },
      { name: 'User ID', value: userId, inline: false },
    ];

    if (ddData) {
      fields.push(
        { name: 'Country', value: ddData.country, inline: true },
        { name: 'Experience', value: ddData.yearsExperience, inline: true },
        { name: 'Avg Investment', value: ddData.averageInvestment, inline: true },
        { name: 'Referral', value: ddData.referral, inline: false },
        { name: 'X (Twitter)', value: ddData.twitter, inline: false },
        { name: 'About', value: ddData.aboutSelf, inline: false }
      );
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [
            {
              title: 'New User Approval Request',
              description: ddData ? 'User has submitted their Due Diligence form.' : 'User has logged in but not yet submitted DD.',
              color: 0x5865F2,
              fields: fields,
              timestamp: new Date().toISOString(),
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 3,
                  label: 'Approve',
                  custom_id: `approve_${userId}`,
                },
                {
                  type: 2,
                  style: 4,
                  label: 'Deny',
                  custom_id: `deny_${userId}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send Discord message:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Discord approval message:', error);
    return false;
  }
}
