const { Client, GatewayIntentBits } = require("discord.js");

// cria o bot
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// quando ligar
client.once("ready", () => {
  console.log("✅ BOT ONLINE:", client.user.tag);
});

// tentar login
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("✅ LOGIN OK"))
  .catch(err => console.error("❌ ERRO AO LOGAR:", err));