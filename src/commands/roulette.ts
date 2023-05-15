import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType
} from "discord.js";
import { SlashCommand } from "../structs";
import { ActionRowBuilder } from "@discordjs/builders";
import { randomUUID } from "crypto";
import { ROULETTE_IMG, Utils } from "../utils";

export default new SlashCommand({
  name: "roulette",
  description: "Pick your bets and spin the roulette!",
  options: [
    {
      name: "bet",
      description: "The amount of chips you want to bet",
      type: ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  exe: async ({ int, args }) => {
    await int.deferReply();

    let bet = args.getInteger("bet");
    let stLabels = ["1st 12", "2nd 12", "3rd 12"];
    let ndLabels = ["1-18", "Red", "Black", "19-36"];
    let rdLabels = ["Even", "Odd"];
    let startId = randomUUID();
    let customIds = [...stLabels, ...ndLabels, ...rdLabels].map(() =>
      randomUUID()
    );

    let stRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...stLabels.map(
        (label, i) =>
          new ButtonBuilder({
            customId: customIds[i],
            label,
            style: ButtonStyle.Secondary
          })
      )
    );
    let ndRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...ndLabels.map(
        (label, i) =>
          new ButtonBuilder({
            customId: customIds[i + 3],
            label,
            style: ButtonStyle.Secondary
          })
      )
    );
    let rdRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...rdLabels.map(
        (label, i) =>
          new ButtonBuilder({
            customId: customIds[i + 7],
            label,
            style: ButtonStyle.Secondary
          })
      ),
      new ButtonBuilder({
        customId: startId,
        label: "Spin",
        style: ButtonStyle.Success
      })
    );
    let buttons = [
      ...stRow.components,
      ...ndRow.components,
      ...rdRow.components
    ];
    let imgName = "bets.png";
    let betsImg = new AttachmentBuilder(ROULETTE_IMG + imgName, {
      name: imgName
    });
    let ebd = Utils.embed({ image: { url: `attachment://${imgName}` } });

    await int.editReply({
      embeds: [ebd],
      components: [stRow, ndRow, rdRow],
      files: [betsImg]
    });

    const filter = (bint: ButtonInteraction<"cached">) => {
      const validate = () => Utils.validateBint(customIds, bint.customId);
      const rightUser = () => bint.user.id === int.user.id;
      return validate() && rightUser();
    };

    let cl = int.channel.createMessageComponentCollector({
      filter,
      idle: 6e4,
      componentType: ComponentType.Button
    });

    cl.on("collect", async bint => {
      await bint.deferUpdate();

      let i: string;
      while (!i) {}
    });
  }
});
