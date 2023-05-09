import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType
} from "discord.js";
import { SlashCommand } from "../structs";
import { CHIPS_EMOJI, IMG_DIR, Utils } from "../utils";
import { randomUUID } from "crypto";
import { DatabaseModel } from "../types";

export default new SlashCommand({
  name: "coinflip",
  description: "Flip a coin, and bet on the outcome.",
  options: [
    {
      name: "bet",
      description: "The amount of chips you want to bet.",
      type: ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  exe: async ({ int, args, data }) => {
    let bet = args.getInteger("bet");
    let isValid = Utils.validateBet(bet, data.chips);
    if (typeof isValid === "string")
      return await int.reply({ content: isValid, ephemeral: true });

    let [headsId, tailsId] = [randomUUID(), randomUUID()];

    let row = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder({
        customId: headsId,
        label: "Heads",
        style: ButtonStyle.Secondary
      }),
      new ButtonBuilder({
        customId: tailsId,
        label: "Tails",
        style: ButtonStyle.Secondary
      })
    ]);

    let ebd = Utils.embed({ title: "**heads or tails?**" });
    await int.reply({ embeds: [ebd], components: [row] });

    const filter = (bint: ButtonInteraction<"cached">) => {
      if (!Utils.validateBint([headsId, tailsId], bint.customId)) return false;
      return bint.user.id === int.user.id;
    };

    let cl = int.channel.createMessageComponentCollector({
      filter,
      time: 6e4,
      componentType: ComponentType.Button
    });
    let choice: "heads" | "tails";
    cl.on("collect", async bint => {
      await bint.deferUpdate();
      choice = headsId === bint.customId ? "heads" : "tails";
      ebd.setTitle(`**you chose ${choice}! Flipping...**`);
      await int.editReply({ embeds: [ebd], components: [] });
      await Utils.sleep(Utils.rng(2700, 3000));
      cl.stop(choice);
    });
    cl.on("end", async coll => {
      if (!coll.size) return;
      let HorT = Utils.rng(1, 2) === 1 ? "heads" : "tails";
      let w = HorT === choice;
      let totWin = bet * 2;
      let coinImg = new AttachmentBuilder(IMG_DIR + HorT + ".png", {
        name: "coin.png"
      });
      let title = w
        ? `**You won! here's \`${totWin}\` chips! ${CHIPS_EMOJI} 🎉🎉**`
        : `You lost! :( gimme \`${bet}\` chips! ${CHIPS_EMOJI}`;

      ebd.setTitle(title);
      ebd.setColor(w ? 0x00ff00 : 0xff0000);
      ebd.setImage("attachment://coin.png");
      ebd.setFooter({ text: `the coin flipped ${HorT}!` });
      await int.editReply({ embeds: [ebd], files: [coinImg] });
      let newData: DatabaseModel = {
        chips: w ? data.chips + totWin : data.chips - bet,
        wins: w ? data.wins + 1 : data.wins,
        losses: w ? data.losses : data.losses + 1
      };
      await Utils.writeDb(int.user.id, newData);
    });
  }
});
