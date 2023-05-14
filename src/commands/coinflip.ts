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
import { CHIPS_EMOJI, COINFLIP_IMG, Utils } from "../utils";
import { randomUUID } from "crypto";

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
    let msg = await Utils.validateBet(bet, data.chips, int.user.id);

    if (typeof msg === "string") {
      await int.reply({ content: msg, ephemeral: true });
      return;
    }

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
      await Utils.sleep(Utils.rng(2.7e3, 3e3));
      cl.stop(choice);
    });
    cl.on("end", async coll => {
      if (!coll.size) return;

      let HorT = Utils.rng(1, 2) === 1 ? "heads" : "tails";
      let won = HorT === choice;
      let winnings = bet * 2;
      let coinImg = new AttachmentBuilder(COINFLIP_IMG + HorT + ".png", {
        name: "coin.png"
      });
      let title = won
        ? `**You won! here's \`${winnings.toLocaleString()}\` chips! ${CHIPS_EMOJI} 🎉🎉**`
        : `You lost! :( gimme \`${bet.toLocaleString()}\` chips! ${CHIPS_EMOJI}`;

      ebd.setTitle(title);
      ebd.setColor(won ? 0x00ff00 : 0xff0000);
      ebd.setImage("attachment://coin.png");
      ebd.setFooter({ text: `the coin flipped ${HorT}!` });

      await int.editReply({ embeds: [ebd], files: [coinImg] });

      if (won) {
        await Utils.editChips(int.user.id, winnings);
        await Utils.editWins(int.user.id, 1);
      } else {
        await Utils.editLosses(int.user.id, 1);
      }
    });
  }
});
