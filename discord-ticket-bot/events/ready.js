const { REST, Routes } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);

    // Register slash commands
    const commands = [];
    client.commands.forEach(command => {
      commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    try {
      console.log('🔄 Registering slash commands...');
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
        { body: commands }
      );
      console.log('✅ Slash commands registered successfully!');
    } catch (error) {
      console.error('❌ Error registering commands:', error);
    }

    // Set bot status
    client.user.setActivity('for tickets 🎫', { type: 3 }); // Type 3 = Watching
  },
};
