const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the ticket system panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle(config.ticketPanelEmbed.title)
      .setDescription(config.ticketPanelEmbed.description)
      .setColor(config.ticketPanelEmbed.color)
      .setFooter({ text: config.ticketPanelEmbed.footer })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ content: 'Ticket panel created!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
