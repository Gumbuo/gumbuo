const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Store active tickets
const activeTickets = new Map();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🎫 Ticket system ready!`);
  console.log(`📢 Announcement system ready!`);

  // Set bot status
  client.user.setActivity('Support Tickets | /help', { type: 'WATCHING' });
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    // TICKET COMMAND
    if (commandName === 'ticket') {
      await handleTicketCreate(interaction);
    }

    // CLOSE COMMAND
    else if (commandName === 'close') {
      await handleTicketClose(interaction);
    }

    // ANNOUNCE COMMAND
    else if (commandName === 'announce') {
      await handleAnnouncement(interaction);
    }

    // HELP COMMAND
    else if (commandName === 'help') {
      await handleHelp(interaction);
    }
  } catch (error) {
    console.error('Error handling command:', error);
    await interaction.reply({
      content: '❌ An error occurred while processing your command.',
      ephemeral: true
    });
  }
});

// Create support ticket
async function handleTicketCreate(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;

  // Check if user already has an open ticket
  const existingTicket = guild.channels.cache.find(
    ch => ch.name === `ticket-${user.username.toLowerCase()}` && ch.parentId === process.env.TICKET_CATEGORY_ID
  );

  if (existingTicket) {
    return interaction.reply({
      content: `❌ You already have an open ticket: ${existingTicket}`,
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: process.env.TICKET_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: process.env.STAFF_ROLE_ID,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    });

    // Store ticket info
    activeTickets.set(ticketChannel.id, {
      userId: user.id,
      createdAt: Date.now(),
      messages: [],
    });

    // Send welcome message to ticket
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('🎫 Gumbuo Support Ticket')
      .setDescription(`Hello ${user}! Thank you for opening a support ticket.`)
      .addFields(
        { name: '📝 Please describe your issue', value: 'Our support team will assist you shortly.' },
        { name: '⏱️ Response Time', value: 'We typically respond within a few hours.' }
      )
      .setFooter({ text: 'Gumbuo Support | Use /close to close this ticket' })
      .setTimestamp();

    const closeButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

    await ticketChannel.send({
      content: `${user} <@&${process.env.STAFF_ROLE_ID}>`,
      embeds: [welcomeEmbed],
      components: [closeButton]
    });

    await interaction.editReply({
      content: `✅ Ticket created! ${ticketChannel}`,
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    await interaction.editReply({
      content: '❌ Failed to create ticket. Please contact an administrator.',
    });
  }
}

// Close support ticket
async function handleTicketClose(interaction) {
  const channel = interaction.channel;

  // Check if this is a ticket channel
  if (!channel.name.startsWith('ticket-') || channel.parentId !== process.env.TICKET_CATEGORY_ID) {
    return interaction.reply({
      content: '❌ This command can only be used in ticket channels.',
      ephemeral: true
    });
  }

  await interaction.deferReply();

  try {
    // Fetch all messages for transcript
    const messages = [];
    let lastId;

    while (true) {
      const options = { limit: 100 };
      if (lastId) options.before = lastId;

      const batch = await channel.messages.fetch(options);
      messages.push(...batch.values());

      if (batch.size < 100) break;
      lastId = batch.last().id;
    }

    messages.reverse();

    // Create transcript
    const transcript = messages.map(m => {
      const timestamp = new Date(m.createdTimestamp).toLocaleString();
      return `[${timestamp}] ${m.author.tag}: ${m.content}`;
    }).join('\n');

    // Save transcript
    const transcriptDir = path.join(__dirname, 'transcripts');
    if (!fs.existsSync(transcriptDir)) {
      fs.mkdirSync(transcriptDir);
    }

    const filename = `ticket-${channel.name}-${Date.now()}.txt`;
    const filepath = path.join(transcriptDir, filename);
    fs.writeFileSync(filepath, transcript);

    // Send transcript to log channel
    const transcriptChannel = await client.channels.fetch(process.env.TRANSCRIPT_CHANNEL_ID);
    const transcriptEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🔒 Ticket Closed')
      .addFields(
        { name: 'Channel', value: channel.name, inline: true },
        { name: 'Closed By', value: interaction.user.tag, inline: true },
        { name: 'Messages', value: messages.length.toString(), inline: true }
      )
      .setTimestamp();

    await transcriptChannel.send({
      embeds: [transcriptEmbed],
      files: [{ attachment: filepath, name: filename }]
    });

    // Close notification
    await interaction.editReply('✅ Ticket will be closed in 5 seconds...');

    setTimeout(async () => {
      await channel.delete();
      activeTickets.delete(channel.id);
    }, 5000);

  } catch (error) {
    console.error('Error closing ticket:', error);
    await interaction.editReply('❌ Failed to close ticket. Please try again.');
  }
}

// Post announcement
async function handleAnnouncement(interaction) {
  // Check if user has staff role
  if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
    return interaction.reply({
      content: '❌ You do not have permission to use this command.',
      ephemeral: true
    });
  }

  const title = interaction.options.getString('title');
  const message = interaction.options.getString('message');
  const channelId = interaction.options.getString('channel');
  const ping = interaction.options.getBoolean('ping') ?? false;

  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await client.channels.fetch(channelId);

    const announcementEmbed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle(`🛸 ${title}`)
      .setDescription(message)
      .setFooter({ text: 'Gumbuo | gumbuo.io' })
      .setTimestamp();

    const content = ping ? '@everyone' : null;

    await channel.send({
      content,
      embeds: [announcementEmbed]
    });

    await interaction.editReply('✅ Announcement posted successfully!');

  } catch (error) {
    console.error('Error posting announcement:', error);
    await interaction.editReply('❌ Failed to post announcement. Make sure the channel ID is correct.');
  }
}

// Help command
async function handleHelp(interaction) {
  const helpEmbed = new EmbedBuilder()
    .setColor('#00D4FF')
    .setTitle('🛸 Gumbuo Support Bot - Commands')
    .setDescription('Here are all available commands:')
    .addFields(
      {
        name: '🎫 /ticket',
        value: 'Create a new support ticket. Our team will assist you!'
      },
      {
        name: '🔒 /close',
        value: 'Close the current support ticket (ticket channels only)'
      },
      {
        name: '📢 /announce',
        value: 'Post an announcement (Staff only)\nOptions: title, message, channel, ping'
      },
      {
        name: '❓ /help',
        value: 'Show this help message'
      }
    )
    .setFooter({ text: 'Gumbuo Support | gumbuo.io' })
    .setTimestamp();

  await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
}

// Handle button interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'close_ticket') {
    // Treat button click like /close command
    await handleTicketClose(interaction);
  }
});

// Login
client.login(process.env.BOT_TOKEN);
