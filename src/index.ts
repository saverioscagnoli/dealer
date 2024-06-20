import { Client } from "discord.js";

const client = new Client({ intents: ["Guilds"] });

client.on("ready", () => {
  console.log("Bot is ready");
});

client.login(process.env.TOKEN);
