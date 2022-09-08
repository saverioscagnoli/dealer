import { MsgCommand, Schema } from "../../typings";
import { misc, sqlite, Emojis } from "../../utils";

const Ranking: MsgCommand = {
  name: "ranking",
  description:
    "Displays the ranking of this server based on chip number. " + Emojis.Chips,
  aliases: ["rank"],
  exe: async ({ msg }) => {
    let req = await msg.guild.members.fetch();
    let userIDs = req.map((m) => m.user.id);
    let players: Schema[] = [];
    for (let i in userIDs) {
      let pl = await sqlite.checkDB(userIDs[i], null, false);
      if (pl) {
        players.push({
          name: pl.name,
          chips: pl.chips,
          wins: pl.wins,
          losses: pl.losses,
        });
      }
    }
    let sorted = players.sort((a, b) => b.chips - a.chips);
    let formatted: string[] = [];
    for (let i = 0; i < sorted.length; i++) {
      formatted.push(
        `**${i + 1}. ${sorted[i].name}** - **W: \`${sorted[i].wins}\` | L: \`${
          sorted[i].losses
        }\`** - **\`${sorted[i].chips.toLocaleString()}\` ${Emojis.Chips}**`
      );
    }
    let ebd = misc.Embed({
      title: `${msg.guild.name}'s most addicted gamblers!`,
      desc: formatted.slice(0, 50).join("\n"),
      thumb: msg.guild.iconURL(),
    });
    await msg.channel.send({
      embeds: [ebd],
    });
    return;
  },
};

export { Ranking };
