import { SlashCommand } from "~/core/slash-command";
import { code } from "~/lib/utils";

export default new SlashCommand({
  name: "ping",
  description: "Pong! 🏓",
  exe: async int => {
    await int.reply(`Pong! 🏓 ${code`${int.client.ws.ping}ms`}`);
  }
});
