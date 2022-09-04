import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { MsgCommand } from "../../typings";
import { math, misc, sqlite } from "../../utils";

const Coinflip: MsgCommand = {
  name: "coinflip",
  description: "Bet some chips and choose heads or tails!",
  aliases: ["cf"],
  exe: async ({ msg, args, authorID, pl }) => {
    let n = Number(args[0]);
    let valid = await sqlite.bet(authorID, n, msg);
    if (!valid) return true;

    let hID = math.buttonID("heads");
    let tID = math.buttonID("tails");
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      misc.Button({
        customID: hID,
        label: "Heads",
        style: ButtonStyle.Secondary,
      }),
      misc.Button({
        customID: tID,
        label: "Tails",
        style: ButtonStyle.Secondary,
      })
    );

    await msg.channel.send({
      components: [row],
    });
  },
};

export { Coinflip };
