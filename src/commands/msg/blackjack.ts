import { MsgCommand } from "../../typings";
import { EmbedAssets, Emojis, misc } from "../../utils";
import { createCanvas, loadImage } from "canvas";
import { AttachmentBuilder } from "discord.js";

const Blackjack: MsgCommand = {
  name: "blackjack",
  description: "Place a bet and play blackjack!",
  aliases: ["bj"],
  exe: async ({ msg, args, authorID, username }) => {
    let canvas = createCanvas(508, 339);
    let ctx = canvas.getContext("2d");
    let bg = await loadImage(EmbedAssets.CasinoTable);
    let propic = await loadImage(EmbedAssets.ProPicPixelArt);
    let AuthPic = await loadImage(
      msg.author.displayAvatarURL({ extension: "png" })
    );
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(propic, 40, 220, 80, 80);
    ctx.drawImage(AuthPic, 40, 50, 80, 80)
    let atc = new AttachmentBuilder(canvas.createPNGStream(), {
      name: "table.png",
    });
    let ebd = misc.Embed({
      title: `${username} is playing BlackJack! ${Emojis.Chips}`,
      image: "attachment://table.png",
    });
    await msg.channel.send({
      embeds: [ebd],
      files: [atc],
    });
  },
};

export { Blackjack };
