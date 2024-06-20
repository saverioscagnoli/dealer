import { EmbedBuilder } from "discord.js";
import { SlashCommand } from "~/core/slash-command";
import { EMBED_COLOR } from "~/lib/consts";
import { code, rng } from "~/lib/utils";

export default new SlashCommand({
  name: "daily",
  description: "Get your daily dose of chips! 🎉",
  exe: async ({ int, profile }) => {
    let chips = rng(5000, 10000);

    let embed = new EmbedBuilder()
      .setTitle(`You have claimed ${code(chips.toLocaleString())} chips! 🎉`)
      .setColor(EMBED_COLOR);

    await int.reply({ embeds: [embed] });
    await profile.addChips(chips);
  }
});
