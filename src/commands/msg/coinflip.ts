import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { MsgCommand } from "../../typings";
import {
  EmbedAssets,
  Emojis,
  filters,
  math,
  misc,
  sleep,
  sqlite,
} from "../../utils";

const Coinflip: MsgCommand = {
  name: "coinflip",
  description: "Bet some chips and choose heads or tails!",
  aliases: ["cf"],
  exe: async ({ msg, args, authorID }) => {
    let n = Number(args[0]);
    let valid = await sqlite.bet(authorID, n, msg);
    if (!valid) return true;

    let choice: string;
    let coin = math.flip() ? "heads" : "tails";
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
    let ebd = misc.Embed({
      title: "Heads or tails?",
      image: EmbedAssets.CoinflipStill,
    });
    let botMsg = await msg.channel.send({
      embeds: [ebd],
      components: [row],
    });

    let cl = msg.channel.createMessageComponentCollector({
      filter: filters.coinflip([hID, tID], authorID),
      idle: 15e3,
      componentType: ComponentType.Button,
      dispose: true,
    });
    cl.on("collect", async (btnInt) => {
      await btnInt.deferUpdate();
      choice = btnInt.component.label.toLowerCase();
      cl.stop();
    });
    cl.on("end", async (coll) => {
      await botMsg.edit({
        components: [],
      });
      if (coll.size === 0) return;
      ebd
        .setTitle(`You chose **\`${choice}\`**!`)
        .setImage(EmbedAssets.CoinflipGif)
        .setFooter({ text: "Flipping the coin..." });
      await botMsg.edit({
        embeds: [ebd],
      });
      ebd
        .setTitle(`The coing flipped **\`${coin}\`**!`)
        .setImage(EmbedAssets.CoinflipStill);
      let str: string;
      await sleep(2);
      if (choice == coin) {
        str = `**You won \`${n * 2}\` chips!** ${Emojis.Chips}`;
        ebd.setColor("#00FF00").setFooter({ text: "You won!" });
        await sqlite.update(authorID, "chips", n * 2);
        await sqlite.updWL(authorID, "wins");
      } else {
        str = `**You lost \`${n}\` chips!** ${Emojis.Chips}`;
        ebd.setColor("#FF0000").setFooter({ text: "You lost!" });
        await sqlite.updWL(authorID, "losses");
      }
      await botMsg.edit({
        content: str,
        embeds: [ebd],
      });
    });
  },
};

export { Coinflip };
