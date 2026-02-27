const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
require('dotenv').config();

console.log('[BOOT] 1. Iniciando script...');

// --- SERVIDOR WEB ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Online 🟢'));
app.listen(PORT, () => console.log(`[BOOT] 2. Web Server rodando na porta ${PORT}`));

// --- CONFIGURAÇÃO ---
console.log('[BOOT] 3. Lendo variáveis de ambiente...');
const rawToken = process.env.DISCORD_TOKEN;
const TOKEN = rawToken ? rawToken.replace(/['"]/g, '').trim() : null;

if (!TOKEN) {
    console.error('❌ [ERRO CRÍTICO] Variável DISCORD_TOKEN não encontrada ou vazia!');
    console.error('-> Verifique no Render: Dashboard > Environment > Environment Variables');
} else {
    console.log(`[BOOT] Token detectado (Tamanho: ${TOKEN.length} caracteres)`);
}

const GUILD_ID = process.env.GUILD_ID;
// Tenta obter Client ID do token se não estiver definido
function getClientId(token) {
    try { return Buffer.from(token.split('.')[0], 'base64').toString('utf-8'); } 
    catch (e) { return null; }
}
const CLIENT_ID = process.env.CLIENT_ID || (TOKEN ? getClientId(TOKEN) : null);

// --- CLIENTE ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- COMANDOS ---
const commands = [
    new SlashCommandBuilder().setName('ponto').setDescription('🛂 Abrir painel de ponto'),
    new SlashCommandBuilder().setName('ranking').setDescription('🏆 Ver ranking de horas'),
    new SlashCommandBuilder().setName('help').setDescription('ℹ️ Ver ajuda'),
    new SlashCommandBuilder().setName('debug').setDescription('🛠️ Status do sistema')
];

// --- EVENTOS ---
client.once('ready', async () => {
    console.log(`✅ [DISCORD] Logado com sucesso como ${client.user.tag}`);
    
    // Deploy de comandos
    if (CLIENT_ID) {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        try {
            console.log('🔄 [DISCORD] Iniciando registro de comandos...');
            if (GUILD_ID) {
                await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
                console.log(`✅ [DISCORD] Comandos registrados na GUILD ${GUILD_ID}`);
            } else {
                await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
                console.log('✅ [DISCORD] Comandos registrados GLOBALMENTE');
            }
        } catch (error) {
            console.error('❌ [DISCORD] Erro ao registrar comandos:', error);
        }
    } else {
        console.warn('⚠️ [DISCORD] CLIENT_ID não definido. Comandos não foram atualizados.');
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            console.log(`[CMD] /${commandName}`);

            if (commandName === 'ponto') {
                const embed = new EmbedBuilder()
                    .setTitle('🛂 Controle de Ponto')
                    .setDescription('Gerencie seu turno abaixo:')
                    .setColor(0x0099FF);

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('iniciar').setLabel('Iniciar').setStyle(ButtonStyle.Success).setEmoji('🟢'),
                    new ButtonBuilder().setCustomId('pausar').setLabel('Pausar').setStyle(ButtonStyle.Secondary).setEmoji('⏸️'),
                    new ButtonBuilder().setCustomId('finalizar').setLabel('Finalizar').setStyle(ButtonStyle.Danger).setEmoji('🔴')
                );
                
                await interaction.reply({ embeds: [embed], components: [row] });
            }
            else if (commandName === 'help') {
                await interaction.reply({ content: 'Comandos: /ponto, /ranking, /debug', ephemeral: true });
            }
            else if (commandName === 'ranking') {
                await interaction.reply('🏆 Ranking: Em desenvolvimento.');
            }
            else if (commandName === 'debug') {
                await interaction.reply(`🛠️ Ping: ${client.ws.ping}ms`);
            }
        }

        if (interaction.isButton()) {
            const action = interaction.customId;
            console.log(`[BTN] ${action}`);
            
            const messages = {
                'iniciar': '✅ Ponto iniciado!',
                'pausar': '⏸️ Ponto pausado.',
                'finalizar': '🔴 Ponto finalizado.'
            };

            await interaction.reply({ content: messages[action] || 'Erro', ephemeral: true });
        }
    } catch (error) {
        console.error('❌ Erro:', error);
    }
});

// --- LOGIN ---
if (TOKEN) {
    console.log('[BOOT] 4. Tentando conectar ao Discord...');
    client.login(TOKEN)
        .then(() => console.log('[BOOT] 5. Login solicitado com sucesso (aguardando evento ready)...'))
        .catch(err => {
            console.error('❌ [ERRO FATAL] Falha ao conectar no Discord:');
            console.error(err);
        });
} else {
    console.error('❌ [ERRO FATAL] Impossível conectar: Sem Token.');
}
