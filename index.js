const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Logado como ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('Mostra os comandos do bot')
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log("Registrando comandos...");
        await rest.put(
            Routes.applicationCommands(client.user.id), // pega ID automático
            { body: commands }
        );
        console.log("Comandos registrados.");
    } catch (err) {
        console.error(err);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'help') {
        await interaction.reply({
            content: "Comandos disponíveis:\n/help",
            ephemeral: true
        });
    }
});

client.login(TOKEN);
