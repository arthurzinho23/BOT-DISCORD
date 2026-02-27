const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const startWaker = require('./waker');
require('dotenv').config();

const app = express();

// ⚡ PORTA OBRIGATÓRIA DO RENDER
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot online ✅");
});

app.listen(PORT, () => {
  console.log("🌐 Web server ativo na porta " + PORT);
  
  // Inicia o Waker para manter o bot acordado
  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
  startWaker(APP_URL);
});

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Variáveis Globais
const EXTERNAL_API_URL = 'https://fvmp-tau.vercel.app/';

client.once("ready", () => {
  console.log(`✅ Logado como ${client.user.tag}`);
});

// --- COMANDOS SIMPLES (PREFIXO !) ---
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    message.reply("Pong 🏓");
  }

  if (message.content === "!debug") {
      const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('Debug Status')
          .setDescription(`✅ Bot Online\n🏓 Ping: ${client.ws.ping}ms\n🔗 API Externa: ${EXTERNAL_API_URL}`);
      message.reply({ embeds: [embed] });
  }

  if (message.content === "!help") {
      const embed = new EmbedBuilder()
        .setTitle('Comandos Disponíveis')
        .setDescription('Use os comandos abaixo para interagir com o bot:')
        .addFields(
            { name: '!ponto', value: 'Abre o painel de controle de ponto' },
            { name: '!ranking', value: 'Exibe o ranking de horas' },
            { name: '!status', value: 'Verifica status da conexão' }
        );
      message.reply({ embeds: [embed] });
  }

  if (message.content === "!ponto") {
      const row = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setLabel('Abrir Painel')
                  .setStyle(ButtonStyle.Link)
                  .setURL(EXTERNAL_API_URL)
          );
      
      message.reply({ content: 'Clique abaixo para acessar o sistema de ponto:', components: [row] });
  }
});

// TOKEN VEM DO RENDER
// Limpeza básica do token para evitar erros de cópia
const token = process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.replace(/^"|"$/g, '').trim() : null;
client.login(token);
