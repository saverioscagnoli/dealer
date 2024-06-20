import { sleep } from "bun";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";
import { SlashCommand } from "~/core/slash-command";
import { EMBED_COLOR } from "~/lib/consts";
import { flip, rng, verifyBet } from "~/lib/utils";

export default new SlashCommand({
  name: "coinflip",
  description: "Flip a coin! 🪙",
  options: [
    {
      name: "bet",
      description: "The amount of chips you want to bet.",
      type: ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  exe: async ({ int, profile }) => {
    let bet = +int.options.get("bet").value;
    let valid = await verifyBet(bet, profile.getChips(), int);

    if (!valid) return;

    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("heads")
        .setLabel("Heads")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("tails")
        .setLabel("Tails")
        .setStyle(ButtonStyle.Secondary)
    );

    let embed = new EmbedBuilder()
      .setTitle("Heads or Tails?")
      .setColor(EMBED_COLOR);

    let response = await int.reply({ embeds: [embed], components: [row] });

    let collector = response.createMessageComponentCollector({
      filter: i => i.user.id === int.user.id,
      time: 15000,
      max: 1
    });

    collector.on("collect", async i => {
      await i.deferUpdate();

      embed.setTitle("Flipping...");

      await response.edit({ embeds: [embed], components: [] });
    });

    collector.on("end", async coll => {
      if (coll.size === 0) {
        await response.delete();
        return;
      }

      await sleep(rng(2000, 3000));

      let result = flip() ? "heads" : "tails";
      let win = result === coll.first().customId;

      let msg = win
        ? `You won ${(bet * 2).toLocaleString()} chips! 🎉`
        : `You lost ${bet.toLocaleString()} chips! :(`;

      embed.setTitle(msg);

      await response.edit({ embeds: [embed] });

      if (win) {
        profile.addChips(bet);
        profile.addWin();
      } else {
        profile.removeChips(bet);
        profile.addLoss();
      }
    });
  }
});
