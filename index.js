const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
require('dotenv').config();

console.log('[BOOT] Iniciando Bot 911...');

// --- 1. SERVIDOR WEB ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Online 🟢'));
app.listen(PORT, () => console.log(`🌐 Web Server rodando na porta ${PORT}`));

// --- 2. CONFIGURAÇÃO ---
const TOKEN = process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.replace(/['"]/g, '').trim() : null;
const GUILD_ID = process.env.GUILD_ID;

function getClientId(token) {
    try { return Buffer.from(token.split('.')[0], 'base64').toString('utf-8'); } 
    catch (e) { return null; }
}
const CLIENT_ID = process.env.CLIENT_ID || (TOKEN ? getClientId(TOKEN) : null);

// --- 3. CLIENTE ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- 4. COMANDOS ---
const commands = [
    // ATENÇÃO: Mantenha as aspas nos nomes dos comandos!
    new SlashCommandBuilder().setName('ponto').setDescription('🛂 Abrir painel de ponto'),
    new SlashCommandBuilder().setName('ranking').setDescription('🏆 Ver ranking de horas'),
    new SlashCommandBuilder().setName('help').setDescription('ℹ️ Ver ajuda'),
    new SlashCommandBuilder().setName('debug').setDescription('🛠️ Status do sistema')
];

// --- 5. DEPLOY ---
async function deployCommands() {
    if (!TOKEN || !CLIENT_ID) return console.error('❌ Token ou Client ID faltando.');
    
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log(`🔄 Deploy de ${commands.length} comandos...`);
        if (GUILD_ID) {
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
            console.log(`✅ Comandos na GUILD ${GUILD_ID}`);
        } else {
            await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
            console.log('✅ Comandos GLOBAIS (Demora ~1h)');
        }
    } catch (error) {
        console.error('❌ Erro no deploy:', error);
    }
}

// --- 6. EVENTOS ---
client.once('ready', async () => {
    console.log(`✅ Logado como ${client.user.tag}`);
    await deployCommands();
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            console.log(`[CMD] /${commandName}`);

            // VERIFICAÇÃO DE COMANDOS
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
                // Removido backticks internos para evitar erros de cópia
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

if (TOKEN) client.login(TOKEN).catch(e => console.error('❌ Login erro:', e));
else console.error('❌ Sem Token');
