import { EmbedBuilder } from "discord.js";
import { SlashCommand } from "~/core/slash-command";
import { client } from "~/index";
import { EMBED_COLOR } from "~/lib/consts";
import { code } from "~/lib/utils";

export default new SlashCommand({
  name: "ping",
  description: "Pong! 🏓",
  exe: async ({ int }) => {
    let ping = client.ws.ping;

    let embed = new EmbedBuilder()
      .setDescription(`Pong! 🏓 ${code(ping + "ms")}`)
      .setColor(EMBED_COLOR);

    await int.reply({ embeds: [embed] });
  }
});
