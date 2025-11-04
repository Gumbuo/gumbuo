# Discord Webhook Setup for Auto-Announcements

This guide will help you set up automatic Discord notifications when code is pushed to production.

## Step 1: Create a Discord Webhook

1. Open your Discord server
2. Go to the channel where you want announcements (e.g., #announcements)
3. Click the ⚙️ gear icon (Edit Channel)
4. Go to **Integrations** → **Webhooks** → **New Webhook**
5. Name it "Gumbuo Deployments" (or whatever you like)
6. **Copy the Webhook URL** (it will look like: `https://discord.com/api/webhooks/...`)

## Step 2: Add Webhook to GitHub Secrets

1. Go to your GitHub repository: https://github.com/Gumbuo/gumbuo
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `DISCORD_WEBHOOK`
6. Value: Paste the webhook URL you copied
7. Click **Add secret**

## Step 3: Test It!

The workflow is already set up in `.github/workflows/discord-notify.yml`

To test:
1. Make any small change to your code
2. Commit and push to master
3. Watch your Discord channel for the notification!

## What Gets Posted?

Every time you push to master, Discord will receive:

```
🚀 Gumbuo Deployed to Production
New updates are live on gumbuo.io!

📝 Commit: Your commit message
👤 Author: Your name
🔗 Hash: Link to the commit
```

## Customize the Message

Edit `.github/workflows/discord-notify.yml` to change:
- The message text
- The color (currently cyan: 852223)
- The fields shown
- When it triggers (currently on push to master)

## Troubleshooting

### Notification doesn't appear
- Check that the webhook URL is correct in GitHub Secrets
- Make sure the bot has permission to post in that channel
- Check GitHub Actions tab for error logs

### Want to post to multiple channels?
Add more webhooks as secrets:
- `DISCORD_WEBHOOK_ANNOUNCEMENTS`
- `DISCORD_WEBHOOK_DEVS`
- `DISCORD_WEBHOOK_TESTING`

Then add multiple curl commands in the workflow file!

---

**All set!** Now you'll automatically get notified every time code is deployed. 🎉
