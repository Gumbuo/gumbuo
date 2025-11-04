# 🛸 Gumbuo Support Bot

Complete Discord bot for Gumbuo with support tickets AND announcements!

## Features

- 🎫 **Support Ticket System** - Users can create tickets, staff can manage them
- 📢 **Announcements** - Post styled announcements to any channel
- 💾 **Transcript System** - Automatically saves ticket conversations
- 🔒 **Permission Controls** - Staff-only commands for announcements
- 🤖 **Slash Commands** - Modern Discord interface

## Setup

### 1. Discord Developer Portal

1. Go to https://discord.com/developers/applications
2. Create a new application (or use existing)
3. Go to "Bot" tab → Reset Token → Copy your bot token
4. Go to "OAuth2" → "URL Generator"
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Administrator` (or customize as needed)
5. Copy the generated URL and invite bot to your server

### 2. Get Required IDs

Enable Developer Mode in Discord (`Settings → Advanced → Developer Mode`):

- **Client ID**: Copy from "OAuth2" tab in Developer Portal
- **Guild ID**: Right-click your server → Copy Server ID
- **Staff Role ID**: Right-click your staff role → Copy Role ID
- **Ticket Category ID**: Right-click a category channel → Copy Channel ID
- **Transcript Channel ID**: Right-click a text channel → Copy Channel ID

### 3. Configure Environment

Your `.env` file is already set up! Just update if needed:

```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_server_id_here
STAFF_ROLE_ID=your_staff_role_id_here
TICKET_CATEGORY_ID=category_id_for_tickets
TRANSCRIPT_CHANNEL_ID=channel_id_for_logs
```

### 4. Install Dependencies

```bash
cd discord-ticket-bot
npm install
```

### 5. Deploy Slash Commands

Run this ONCE to register commands with Discord:

```bash
npm run deploy
```

You should see: `✅ Successfully reloaded 4 application (/) commands.`

### 6. Start the Bot

```bash
npm start
```

## Commands

### 🎫 `/ticket`
Creates a private support ticket channel.
- **Who can use**: Everyone
- **What it does**:
  - Creates a private channel visible only to the user and staff
  - Posts a welcome message with ticket info
  - Adds a "Close Ticket" button

### 🔒 `/close`
Closes the current ticket and saves transcript.
- **Who can use**: Everyone (in ticket channels only)
- **What it does**:
  - Saves all messages to a text file
  - Posts transcript to log channel
  - Deletes the ticket channel after 5 seconds

### 📢 `/announce`
Posts a styled announcement embed.
- **Who can use**: Staff only
- **Options**:
  - `title` - Announcement title
  - `message` - Announcement content
  - `channel` - Channel ID to post in
  - `ping` - Whether to ping @everyone (optional)
- **Example**:
  ```
  /announce
    title: New Game Released!
    message: Check out Gumbuo Fighters on gumbuo.io
    channel: 1234567890
    ping: true
  ```

### ❓ `/help`
Shows all available commands.
- **Who can use**: Everyone

## File Structure

```
discord-ticket-bot/
├── bot.js                  # Main bot code
├── deploy-commands.js      # Slash command registration
├── package.json            # Dependencies
├── .env                    # Configuration (DO NOT COMMIT)
├── node_modules/           # Dependencies (auto-generated)
└── transcripts/            # Saved ticket transcripts
```

## Troubleshooting

### Bot doesn't respond to commands
1. Make sure you ran `npm run deploy`
2. Check that bot has proper permissions in your server
3. Verify `.env` has correct IDS

### "Unknown interaction" error
- Re-run `npm run deploy` to refresh commands

### Tickets don't create
- Verify `TICKET_CATEGORY_ID` is correct
- Make sure bot has permission to create channels in that category

### Announcements fail
- Double-check the channel ID you're posting to
- Ensure bot has "Send Messages" permission in that channel

## Hosting

### Option 1: Run Locally
```bash
npm start
```
Keep the terminal window open. Bot stops when you close it.

### Option 2: Run with auto-restart (development)
```bash
npm run dev
```
Uses nodemon to auto-restart on code changes.

### Option 3: Keep Running (Windows)
Use `pm2` to run bot 24/7:
```bash
npm install -g pm2
pm2 start bot.js --name gumbuo-bot
pm2 save
pm2 startup
```

### Option 4: Deploy to Cloud
Deploy to Railway, Heroku, or any Node.js hosting:
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy!

## Auto-Announcements

Want announcements to post automatically when you push code? Check out the GitHub Actions workflow in `.github/workflows/discord-notify.yml`!

## Support

Need help? Create a ticket in the Gumbuo Discord server!

---

**Made with 🛸 by the Gumbuo Team**
