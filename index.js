const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

// ===== SERVIDOR WEB (necessário pro Render) =====
const app = express();

app.get("/", (req, res) => {
  res.send("Bot online ✅");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Servidor web rodando na porta ${PORT}`);
});

// ===== BOT DISCORD =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`🤖 BOT ONLINE: ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("✅ LOGIN OK"))
  .catch(err => console.error("❌ ERRO AO LOGAR:", err));