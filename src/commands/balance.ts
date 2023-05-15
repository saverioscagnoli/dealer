import { SlashCommand } from "../structs";
import { CHIPS_EMOJI, Utils } from "../utils";

export default new SlashCommand({
  name: "balance",
  description: "Check your balance and stats.",
  exe: async ({ int, data }) => {
    let { chips, wins, losses } = data;
    let ebd = Utils.embed({
      title: [
        `**chips: \`${chips.toLocaleString()}\`** ${CHIPS_EMOJI}`,
        `**wins: \`${wins.toLocaleString()}\`**`,
        `**losses: \`${losses.toLocaleString()}\`**`
      ].join("\n"),
      thumbnail: { url: int.user.displayAvatarURL({ size: 64 }) }
    });
    await int.reply({ embeds: [ebd] });
  }
});
