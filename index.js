const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
require('dotenv').config();

// --- CONSTANTES ---
const CMD_PONTO = 'ponto';
const CMD_AJUDA = 'ajuda';

console.log('[BOOT] Iniciando Sistema de Ponto Universal...');

// --- SERVIDOR WEB (Keep Alive) ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot de Ponto Online 🟢'));
app.listen(PORT, () => console.log(`[WEB] Rodando na porta ${PORT}`));

// --- CONFIGURAÇÃO ---
const TOKEN = process.env.DISCORD_TOKEN?.replace(/['"]/g, '').trim();

// Função para extrair Client ID do Token
function getClientId(token) {
    try { return Buffer.from(token.split('.')[0], 'base64').toString('utf-8'); } 
    catch (e) { return null; }
}
const CLIENT_ID = process.env.CLIENT_ID || (TOKEN ? getClientId(TOKEN) : null);

if (!TOKEN || !CLIENT_ID) {
    console.error('❌ [ERRO] Token ou Client ID não encontrados. Verifique o .env');
    process.exit(1);
}

// --- CLIENTE DISCORD ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages 
    ]
});

// --- DEFINIÇÃO DOS COMANDOS ---
const commands = [
    new SlashCommandBuilder()
        .setName(CMD_PONTO)
        .setDescription('🛂 Abrir o painel de registro de ponto'),
    new SlashCommandBuilder()
        .setName(CMD_AJUDA)
        .setDescription('ℹ️ Mostra informações do bot')
];

// --- REGISTRO DE COMANDOS (GLOBAL) ---
async function refreshCommands() {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log(`🔄 [DEPLOY] Atualizando ${commands.length} comandos globais...`);
        
        // Registra comandos globalmente (funciona em todos os servidores)
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        
        console.log('✅ [DEPLOY] Comandos registrados com sucesso! (Modo Universal)');
        console.log('-> Se o comando não aparecer imediatamente, reinicie seu Discord (Ctrl+R).');
    } catch (error) {
        console.error('❌ [ERRO DEPLOY]', error);
    }
}

// --- EVENTOS ---
client.once('ready', async () => {
    console.log(`✅ [ONLINE] Logado como ${client.user.tag}`);
    console.log(`📊 [STATUS] Estou em ${client.guilds.cache.size} servidores.`);
    
    // Força a atualização dos comandos ao iniciar
    await refreshCommands();
});

client.on('interactionCreate', async interaction => {
    try {
        // 1. Comandos de Barra (/ponto)
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            console.log(`[CMD] ${interaction.user.tag} usou /${commandName}`);

            if (commandName === CMD_PONTO) {
                const embed = new EmbedBuilder()
                    .setTitle('🛂 Registro de Ponto')
                    .setDescription('Selecione uma ação abaixo para registrar seu horário.')
                    .setColor(0x2B2D31) // Cor escura padrão Discord
                    .setTimestamp()
                    .setFooter({ text: 'Sistema de Ponto Universal' });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('iniciar')
                        .setLabel('Iniciar Turno')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🟢'),
                    new ButtonBuilder()
                        .setCustomId('pausar')
                        .setLabel('Pausar')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⏸️'),
                    new ButtonBuilder()
                        .setCustomId('finalizar')
                        .setLabel('Finalizar Turno')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔴')
                );
                
                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }
            
            if (commandName === CMD_AJUDA) {
                await interaction.reply({ content: `Use /${CMD_PONTO} para gerenciar seu tempo.`, ephemeral: true });
            }
        }

        // 2. Botões (Iniciar, Pausar, Finalizar)
        if (interaction.isButton()) {
            const action = interaction.customId;
            const user = interaction.user;
            const now = new Date().toLocaleTimeString('pt-BR');

            console.log(`[BTN] ${user.tag} clicou em ${action}`);

            let responseText = '';
            let color = 0x2B2D31;

            switch(action) {
                case 'iniciar':
                    responseText = `🟢 **Turno Iniciado**\n👤 Usuário: <@${user.id}>\n🕒 Horário: ${now}`;
                    color = 0x57F287; // Verde
                    break;
                case 'pausar':
                    responseText = `⏸️ **Turno Pausado**\n👤 Usuário: <@${user.id}>\n🕒 Horário: ${now}`;
                    color = 0xFEE75C; // Amarelo
                    break;
                case 'finalizar':
                    responseText = `🔴 **Turno Finalizado**\n👤 Usuário: <@${user.id}>\n🕒 Horário: ${now}`;
                    color = 0xED4245; // Vermelho
                    break;
            }

            const replyEmbed = new EmbedBuilder()
                .setDescription(responseText)
                .setColor(color)
                .setTimestamp();

            await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
        }
    } catch (error) {
        console.error('❌ [ERRO INTERAÇÃO]', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Ocorreu um erro ao processar.', ephemeral: true }).catch(() => {});
        }
    }
});

// --- LOGIN ---
client.login(TOKEN).catch(err => {
    console.error('❌ [ERRO LOGIN] Falha ao conectar:', err);
});
