import { EmbedBuilder } from "discord.js";
import { SlashCommand } from "~/core/slash-command";
import { EMBED_COLOR } from "~/lib/consts";
import { code } from "~/lib/utils";

export default new SlashCommand({
  name: "balance",
  description: "Check your bank account! 🏦",
  exe: async ({ int, profile }) => {
    let chips = profile.getChips().toLocaleString();

    let embed = new EmbedBuilder()
      .setTitle(`${int.user.displayName}'s balance`)
      .setDescription(
        [
          `chips: ${code(chips)}`,
          `wins: ${code(profile.getWins())}`,
          `losses: ${code(profile.getLosses())}`,
          `winrate: ${code(profile.getWinrate())}`
        ].join("\n")
      )
      .setThumbnail(int.user.displayAvatarURL({ size: 64 }))
      .setColor(EMBED_COLOR);

    await int.reply({ embeds: [embed] });
  }
});
