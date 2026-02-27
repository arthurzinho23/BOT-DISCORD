const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// ===== WEB SERVER (Render precisa disso) =====
const app = express();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Bot online ✅");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🌐 Web server ativo na porta", PORT);
});

// ===== DISCORD BOT =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log("🤖 BOT ONLINE:", client.user.tag);
});

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("✅ LOGIN OK"))
  .catch(err => console.error("❌ ERRO:", err));