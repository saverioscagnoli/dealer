import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { MsgCommand } from "../../typings";
import { EmbedAssets, Emojis, filters, math, misc, sqlite } from "../../utils";

const Roulette: MsgCommand = {
  name: "roulette",
  description: "Play european roulette!",
  aliases: ["rl"],
  exe: async ({ msg, args, username, authorID, client }) => {
    /** Implement table feature */
    let n = Number(args[0]);
    let valid = await sqlite.bet(authorID, n, msg, false);
    if (!valid) return;

    let jID = math.buttonID("join-rl");
    let sID = math.buttonID("start-rl");
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      misc.Button({
        customID: jID,
        label: "Join!",
        style: ButtonStyle.Success,
      }),
      misc.Button({
        customID: sID,
        label: "Start Game!",
        style: ButtonStyle.Success,
      })
    );
    let { roulette } = client.tables;
    let joinedName: string[] = [username];
    let joined: string[] = [authorID];
    roulette.push(authorID);
    let ebd = misc.Embed({
      title: `Dealer is hosting Roulette table no. **\`${roulette.length}\`**! Requested by ${username}.\nThe bet is **\`${n}\`** chips! ${Emojis.Chips}`,
      desc: `In this table there are:\n**• ${joinedName.join("\n• ")}**`,
      footer: {
        text: `Players: ${joinedName.length}/6`,
        iconURL: EmbedAssets.ProPic,
      },
    });

    let botMsg = await msg.channel.send({
      embeds: [ebd],
      components: [row],
    });
    let cl = msg.channel.createMessageComponentCollector({
      filter: filters.join(jID, sID, n, joined),
      idle: 60e3,
      max: 5,
    });
    cl.on("collect", async (btnInt) => {
      await btnInt.deferUpdate();
      if (btnInt.customId === jID) {
        joinedName.push(btnInt.user.username);
        ebd.setDescription(
          `In this table there are:\n**• ${joinedName.join("\n• ")}**`
        );
        ebd.setFooter({
          text: `Players: ${joinedName.length}/6`,
          iconURL: EmbedAssets.ProPic,
        });
        await botMsg.edit({
          embeds: [ebd],
          components: [row],
        });
      } else cl.stop();
    });
    cl.on("collect", (btnInt) => {});
  },
};

export { Roulette };
