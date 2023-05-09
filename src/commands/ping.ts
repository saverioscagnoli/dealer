import { SlashCommand } from "../structs";

export default new SlashCommand({
  name: "ping",
  description: "Pong!",
  exe: async ({ int }) => {
    await int.reply(`Pong! \`${int.client.ws.ping}ms.\` 🏓`);
  }
});
