const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const { createTicket, closeTicket } = require('../utils/tickets');
const config = require('../config.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true }).catch(() => {});
        }
      }
    }

    // Handle Button Interactions
    if (interaction.isButton()) {
      try {
        // Create Ticket Button
        if (interaction.customId === 'create_ticket') {
          // Check if user already has an open ticket
          const existingTicket = interaction.guild.channels.cache.find(
            ch => ch.topic === `ticket-${interaction.user.id}` && ch.parentId === process.env.TICKET_CATEGORY_ID
          );

          if (existingTicket) {
            return await interaction.reply({
              content: `You already have an open ticket: <#${existingTicket.id}>`,
              ephemeral: true
            });
          }

          // Show category selection menu
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_category')
            .setPlaceholder('Select a category')
            .addOptions(
              config.ticketCategories.map(cat => ({
                label: cat.label,
                value: cat.id,
                description: cat.description,
                emoji: cat.emoji
              }))
            );

          const row = new ActionRowBuilder().addComponents(selectMenu);

          await interaction.reply({
            content: '**Please select a category for your ticket:**',
            components: [row],
            ephemeral: true
          });
        }

        // Close Ticket Button
        if (interaction.customId === 'close_ticket') {
          const staffRole = interaction.guild.roles.cache.get(process.env.STAFF_ROLE_ID);
          if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID) &&
              !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Only staff can close tickets!', ephemeral: true });
          }

          await interaction.reply({ content: '🔒 Closing ticket and generating transcript...', ephemeral: false });
          await closeTicket(interaction.channel, interaction.user, client);
        }
      } catch (error) {
        console.error('Button interaction error:', error.message);
        // Silently fail for expired interactions
      }
    }

    // Handle Select Menu Interactions
    if (interaction.isStringSelectMenu()) {
      try {
        if (interaction.customId === 'select_category') {
          const category = interaction.values[0];
          const categoryData = config.ticketCategories.find(cat => cat.id === category);

          await interaction.reply({
            content: `⏳ Creating your ${categoryData.label} ticket...`,
            ephemeral: true
          });

          try {
            await createTicket(interaction, categoryData, client);
          } catch (error) {
            console.error('Error creating ticket:', error);
            await interaction.followUp({
              content: '❌ Failed to create ticket. Please try again or contact an administrator.',
              ephemeral: true
            }).catch(() => {});
          }
        }
      } catch (error) {
        console.error('Select menu interaction error:', error.message);
        // Silently fail for expired interactions
      }
    }
  },
};
