# Discord Ticket Bot 🎫

A full-featured Discord support ticket system built with Discord.js v14. Features button-based ticket creation, categories, staff permissions, and automatic transcript logging.

## ✨ Features

- 🎫 **Button-Based Ticket Creation** - Users click a button to open tickets
- 📋 **Ticket Categories** - Users select from multiple support categories
- 🔒 **Staff Permissions** - Only staff can view and manage tickets
- 📝 **Automatic Transcripts** - Full conversation logs saved when tickets close
- 🎨 **Customizable** - Easy to configure categories, colors, and messages
- ⚡ **Modern Discord.js v14** - Uses latest Discord API features

## 📋 Prerequisites

- Node.js v16.9.0 or higher
- A Discord bot application (see setup below)
- Administrator permissions on your Discord server

## 🚀 Setup Instructions

### 1. Create Your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → Give it a name
3. Go to **"Bot"** tab → Click **"Add Bot"**
4. **Reset Token** and copy it (you'll need this!)
5. Enable these **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Go to **"OAuth2" → "URL Generator"**
7. Select: `bot` and `applications.commands`
8. Select Permission: `Administrator`
9. Copy the generated URL and invite the bot to your server

### 2. Get Required IDs

You need to enable Developer Mode in Discord to get IDs:
- **User Settings → Advanced → Developer Mode** (enable it)

Then right-click to copy IDs for:
- Your **Server (Guild) ID**
- Your **Staff Role ID**
- A **Category Channel ID** (where ticket channels will be created)
- A **Transcript Channel ID** (where closed ticket logs will be sent)

### 3. Configure the Bot

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your IDs:
   ```env
   BOT_TOKEN=your_bot_token_here
   GUILD_ID=your_server_id_here
   STAFF_ROLE_ID=your_staff_role_id_here
   TICKET_CATEGORY_ID=your_category_id_here
   TRANSCRIPT_CHANNEL_ID=your_transcript_channel_id_here
   ```

3. (Optional) Customize categories in `config.json`

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Bot

```bash
npm start
```

You should see:
```
✅ Bot logged in as YourBot#1234
🔄 Registering slash commands...
✅ Slash commands registered successfully!
```

## 📖 Usage

### Setting Up the Ticket Panel

1. Go to the channel where you want the ticket panel
2. Run the command: `/setup`
3. A ticket panel will appear with a "Create Ticket" button

### Creating a Ticket (User)

1. Click the **"Create Ticket"** button
2. Select a category from the dropdown menu
3. A private ticket channel will be created
4. Describe your issue and wait for staff

### Closing a Ticket (Staff)

1. In the ticket channel, click the **"Close Ticket"** button
2. A transcript will be automatically generated and sent to the transcript channel
3. The ticket channel will be deleted after 5 seconds

## 🎨 Customization

### Adding/Editing Categories

Edit `config.json`:

```json
{
  "ticketCategories": [
    {
      "id": "general",
      "label": "General Support",
      "emoji": "❓",
      "description": "General questions and support"
    }
  ]
}
```

### Changing Panel Appearance

Edit the `ticketPanelEmbed` section in `config.json`:

```json
{
  "ticketPanelEmbed": {
    "title": "🎫 Support Ticket System",
    "description": "Your custom description here",
    "color": "#5865F2",
    "footer": "Your footer text"
  }
}
```

## 📁 Project Structure

```
discord-ticket-bot/
├── commands/
│   └── setup.js          # /setup command
├── events/
│   ├── ready.js          # Bot startup
│   └── interactionCreate.js  # Button/menu handlers
├── utils/
│   ├── tickets.js        # Ticket management
│   └── transcripts.js    # Transcript generation
├── transcripts/          # Saved transcripts (auto-created)
├── config.json           # Bot configuration
├── .env                  # Environment variables (create this!)
├── .env.example          # Example env file
└── index.js              # Main bot file
```

## 🔧 Troubleshooting

### Bot doesn't respond to /setup
- Make sure the bot has been invited with `applications.commands` scope
- Check that GUILD_ID is correct in .env
- Restart the bot after changing .env

### Can't create tickets
- Verify TICKET_CATEGORY_ID is a valid category channel
- Make sure the bot has permissions to create channels
- Check that STAFF_ROLE_ID is correct

### Transcripts not saving
- Verify TRANSCRIPT_CHANNEL_ID is correct
- Make sure the bot can send messages in that channel
- Check console for error messages

## 📝 Commands

- `/setup` - Creates the ticket panel (Admin only)

## 🛡️ Permissions

The bot needs these permissions:
- View Channels
- Send Messages
- Manage Channels (to create/delete ticket channels)
- Manage Roles (to set channel permissions)
- Read Message History (for transcripts)

## 🤝 Support

If you need help:
1. Check the troubleshooting section above
2. Make sure all IDs in .env are correct
3. Check the console for error messages
4. Verify bot permissions

## 📄 License

MIT License - Feel free to use and modify!

---

Made with ❤️ using Discord.js v14
