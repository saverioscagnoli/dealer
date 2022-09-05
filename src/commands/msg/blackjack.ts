import { MsgCommand } from "../../typings";
import { EmbedAssets, Emojis, misc, sleep } from "../../utils";
import { createCanvas, loadImage, registerFont } from "canvas";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";

const Blackjack: MsgCommand = {
  name: "blackjack",
  description: "Place a bet and play blackjack!",
  aliases: ["bj"],
  exe: async ({ msg, args, authorID, username }) => {
    let deck = misc.createDeck();
    let pHand = [];
    let dHand = [];
    for (let i = 0; i < 4; i++) {
      if (i % 2 === 0) {
        misc.draw(deck, pHand);
      } else {
        misc.draw(deck, dHand);
      }
    }
    let ebd = misc.Embed({
      title: `${username} is playing Blackjack!`,
      fields: misc.displayHandBJ(pHand, dHand),
      footer: {
        text: "Hit, stand or double?",
        iconURL: msg.author.displayAvatarURL(),
      },
    });
    await msg.channel.send({
      embeds: [ebd],
    });
  },
};

export { Blackjack };
