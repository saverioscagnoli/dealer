import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle
} from "discord.js";
import { Horse, SlashCommand } from "../structs";
import { Utils } from "../utils";
import { randomUUID } from "crypto";

export default new SlashCommand({
  name: "horserace",
  description: "Bet on a horse and watch it go!",
  options: [
    {
      name: "bet",
      description: "The amount of chips each player has to bet to play.",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  exe: async ({ int }) => {
    const names = [
      "Frou Frou",
      "Oakley",
      "Bugsy",
      "Buddy",
      " Chestnut",
      "Buck",
      "Silver",
      "Mane Attraction",
      "Spice",
      "Rusty"
    ];

    let horses = [new Horse(Utils.pick(names))];
    for (let i = 0; i < 3; i++) {
      let name = Utils.pick(names);
      if (horses.map(h => h.name).includes(name)) {
        i--;
      } else {
        horses.push(new Horse(name));
      }
    }

    let startId = randomUUID();

    let row = new ActionRowBuilder<ButtonBuilder>().addComponents([
      ...horses.map(
        h =>
          new ButtonBuilder({
            customId: h.customId,
            label: h.name,
            style: ButtonStyle.Secondary
          })
      ),
      new ButtonBuilder({
        customId: startId,
        label: "Start!",
        style: ButtonStyle.Success,
        disabled: true
      })
    ]);

    const getEmbed = () =>
      Utils.embed({
        description: horses.map(h => h.length.join("")).join("\n\n")
      });

    await int.reply({ embeds: [getEmbed()], components: [row] });

    const filter = async (bint: ButtonInteraction<"cached">) => {
      if (
        !Utils.validateBint(
          [...horses.map(h => h.customId), startId],
          bint.customId
        )
      )
        return false;
      if (bint.customId === startId && bint.user.id !== int.user.id) {
        await bint.reply({
          content: "Only the person who used the command can start the race!",
          ephemeral: true
        });
        return false;
      }
      if (
        horses.map(h => h.ownerId).includes(bint.user.id) &&
        bint.customId !== startId
      ) {
        await bint.reply({ content: "You already joined!", ephemeral: true });
        return false;
      }
      return true;
    };

    let cl = int.channel.createMessageComponentCollector({
      filter,
      idle: 6e4
    });
    cl.on("collect", async bint => {
      await bint.deferUpdate();

      let i = horses.findIndex(h => h.customId === bint.customId);
      horses[i].setOwner(bint.user);

      if (bint.customId === startId || horses.every(h => h.customId !== null)) {
        cl.stop();
        return;
      }
      if (horses.some(h => h.customId !== null)) {
        row.components[4].setDisabled(false);
      }
      row.components[i].setDisabled(true);
      row.components[i].setStyle(ButtonStyle.Success);
      await int.editReply({ components: [row] });
    });
    cl.on("end", async coll => {
      if (!coll.size) return;

      await int.editReply({ components: [] });
      await Utils.sleep(3e3);

      for (let i = 0; i < 10; i++) {
        for (let h of horses) {
          h.length.unshift("💨".repeat(Utils.rng(1, 3)));
        }
        await int.editReply({ embeds: [getEmbed()] });
        await Utils.sleep(1.5e3);
      }
    });
  }
});
