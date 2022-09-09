import { IntCommand } from "../../typings";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import {
  EmbedAssets,
  Emojis,
  filters,
  math,
  misc,
  sleep,
  sqlite,
} from "../../utils";

const Coinflip: IntCommand = {
  name: "coinflip",
  description: "Bet some chips and choose heads or tails!",
  options: [
    {
      name: "bet",
      description: "How many chips you want to bet.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  exe: async ({ int, args, authorID, client }) => {
    let n = args.getInteger("bet");
    let valid = await sqlite.bet(authorID, n, int);
    if (!valid) return true;

    let { coinflip } = client.tables;
    coinflip.push(authorID);
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
    await int.reply({
      embeds: [ebd],
      components: [row],
    });

    let cl = int.channel.createMessageComponentCollector({
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
      coinflip.splice(coinflip.indexOf(authorID), 1);
      await int.editReply({
        components: [],
      });
      if (coll.size === 0) return;
      ebd
        .setTitle(`You chose **\`${choice}\`**!`)
        .setImage(EmbedAssets.CoinflipGif)
        .setFooter({ text: "Flipping the coin..." });
      await int.editReply({
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
      await int.editReply({
        content: str,
        embeds: [ebd],
      });
    });
  },
};

export { Coinflip };
