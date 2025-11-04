const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  // TICKET COMMAND
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a support ticket'),

  // CLOSE COMMAND
  new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the current support ticket'),

  // ANNOUNCE COMMAND
  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post an announcement (Staff only)')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Announcement title')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Announcement message')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('channel')
        .setDescription('Channel ID to post in')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('ping')
        .setDescription('Ping @everyone?')
        .setRequired(false)),

  // HELP COMMAND
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
].map(command => command.toJSON());

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
