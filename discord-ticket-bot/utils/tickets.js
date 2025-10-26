const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const { generateTranscript } = require('./transcripts');

/**
 * Create a new ticket channel
 */
async function createTicket(interaction, categoryData, client) {
  const guild = interaction.guild;
  const user = interaction.user;

  // Generate ticket number
  const ticketNumber = Math.floor(Math.random() * 9000) + 1000;
  const channelName = `ticket-${ticketNumber}`;

  try {
    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: process.env.TICKET_CATEGORY_ID,
      topic: `ticket-${user.id}`, // Used to identify ticket owner
      permissionOverwrites: [
        {
          id: guild.id, // @everyone
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id, // Ticket creator
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
          ],
        },
        {
          id: process.env.STAFF_ROLE_ID, // Staff role
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ManageMessages,
          ],
        },
        {
          id: client.user.id, // Bot
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
          ],
        },
      ],
    });

    // Store ticket info
    client.tickets.set(ticketChannel.id, {
      userId: user.id,
      ticketNumber: ticketNumber,
      category: categoryData.id,
      createdAt: Date.now(),
    });

    // Create ticket embed
    const embed = new EmbedBuilder()
      .setTitle(`${categoryData.emoji} ${categoryData.label} - Ticket #${ticketNumber}`)
      .setDescription(
        `**Welcome ${user}!**\n\n` +
        `Thank you for creating a ticket. Please describe your issue in detail and a staff member will assist you shortly.\n\n` +
        `**Category:** ${categoryData.label}\n` +
        `**Created:** <t:${Math.floor(Date.now() / 1000)}:R>`
      )
      .setColor('#5865F2')
      .setFooter({ text: 'Support Team' })
      .setTimestamp();

    // Close button
    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    // Send initial message
    await ticketChannel.send({
      content: `<@${user.id}> <@&${process.env.STAFF_ROLE_ID}>`,
      embeds: [embed],
      components: [row],
    });

    // Update user's interaction
    await interaction.editReply({
      content: `✅ Ticket created successfully! <#${ticketChannel.id}>`,
      ephemeral: true,
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

/**
 * Close a ticket and generate transcript
 */
async function closeTicket(channel, closedBy, client) {
  try {
    const ticketInfo = client.tickets.get(channel.id);

    // Generate transcript
    const transcriptPath = await generateTranscript(channel, ticketInfo, closedBy);

    // Send transcript to log channel
    const transcriptChannel = client.channels.cache.get(process.env.TRANSCRIPT_CHANNEL_ID);
    if (transcriptChannel && transcriptPath) {
      const ticketUser = await client.users.fetch(ticketInfo.userId);

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket Closed - #${ticketInfo.ticketNumber}`)
        .setColor('#ED4245')
        .addFields(
          { name: 'User', value: `${ticketUser.tag} (${ticketUser.id})`, inline: true },
          { name: 'Closed By', value: `${closedBy.tag}`, inline: true },
          { name: 'Category', value: ticketInfo.category, inline: true },
          { name: 'Created', value: `<t:${Math.floor(ticketInfo.createdAt / 1000)}:R>`, inline: true },
          { name: 'Duration', value: `${Math.floor((Date.now() - ticketInfo.createdAt) / 60000)} minutes`, inline: true }
        )
        .setTimestamp();

      await transcriptChannel.send({
        embeds: [embed],
        files: [{ attachment: transcriptPath, name: `ticket-${ticketInfo.ticketNumber}-transcript.txt` }]
      });
    }

    // Delete ticket from collection
    client.tickets.delete(channel.id);

    // Wait a bit then delete channel
    setTimeout(async () => {
      await channel.delete('Ticket closed');
    }, 5000);

  } catch (error) {
    console.error('Error closing ticket:', error);
  }
}

module.exports = { createTicket, closeTicket };
