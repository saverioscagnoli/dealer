import { MsgCommand } from "../../typings";
import { EmbedAssets, Emojis, misc } from "../../utils";

const Balance: MsgCommand = {
  name: "balance",
  description: "Displays your casino account: name, chips, wins and losses!",
  aliases: ["b"],
  exe: async ({ msg, username, pl }) => {
    let wr = Math.trunc((pl.wins / (pl.wins + pl.losses)) * 100);
    if (pl.wins === 0 && pl.losses === 0) {
      wr = 0;
    }
    let fields = [
      `**Name: \`${pl.name}\`**`,
      `**Chips: \`${pl.chips.toLocaleString()}\`** ${Emojis.Chips}`,
      `**Wins: \`${pl.wins}\`**`,
      `**Losses: \`${pl.losses}\`**`,
      `**Winrate: \`${wr}%\`**`,
    ];
    let ebd = misc.Embed({
      title: `${username}'s casino account!`,
      desc: fields.join("\n"),
      thumb: msg.author.displayAvatarURL(),
      footer: { text: "Kinda broke", iconURL: EmbedAssets.ProPic },
    });
    await msg.channel.send({
      embeds: [ebd],
    });
  },
};

export { Balance };
