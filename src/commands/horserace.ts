import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle
} from "discord.js";
import { Horse, SlashCommand } from "../structs";
import { CHIPS_EMOJI, Utils } from "../utils";
import { randomUUID } from "crypto";

export default new SlashCommand({
  name: "horserace",
  description: "Bet on a horse and watch it go!",
  options: [
    {
      name: "bet",
      description: "The amount of chips each player has to bet to play.",
      type: ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  exe: async ({ int, args, data }) => {
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
    let bet = args.getInteger("bet");

    let msg = await Utils.validateBet(bet, data.chips);

    if (typeof msg === "string") {
      await int.reply({ content: msg, ephemeral: true });
      return;
    }

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

    const getEmbed = (betting?: boolean) => {
      let path = "—".repeat(35) + "🚩";
      let ebd = Utils.embed({
        description: horses
          .map(h => {
            let owner = h.ownerId ? `<@${h.ownerId}>` : "none";
            return `**${h.name}:** ${owner}\n${path}\n${h.progress.join(" ")}`;
          })
          .join("\n\n")
      });
      if (betting) {
        ebd.setTitle(`The bet is \`${bet}\` chips! ${CHIPS_EMOJI}`);
      } else {
        ebd.setFooter(null);
      }
      return ebd;
    };

    await int.reply({ embeds: [getEmbed(true)], components: [row] });

    const filter = async (bint: ButtonInteraction<"cached">) => {
      const validate = () => {
        return Utils.validateBint(
          [...horses.map(h => h.customId), startId],
          bint.customId
        );
      };

      const validateBet = async () => {
        let pData = await Utils.readDb(bint.user.id);
        let msg = await Utils.validateBet(bet, pData.chips, bint.user.id);
        if (typeof msg === "string") {
          await bint.reply({ content: msg, ephemeral: true });
          return false;
        }
        return true;
      };

      const canStart = async () => {
        if (bint.customId === startId && bint.user.id !== int.user.id) {
          await bint.reply({
            content: "Only the person who used the command can start the race!",
            ephemeral: true
          });
          return false;
        }
        return true;
      };

      const notJoined = async () => {
        if (
          horses.map(h => h.ownerId).includes(bint.user.id) &&
          bint.customId !== startId
        ) {
          await bint.reply({ content: "You already joined!", ephemeral: true });
          return false;
        }
        return true;
      };

      return (
        validate() &&
        (await canStart()) &&
        (await notJoined()) &&
        (bint.customId === startId ? true : await validateBet())
      );
    };

    let cl = int.channel.createMessageComponentCollector({
      filter,
      idle: 6e4
    });
    cl.on("collect", async bint => {
      await bint.deferUpdate();

      if (bint.customId !== startId) {
        let i = horses.findIndex(h => h.customId === bint.customId);
        horses[i].setOwner(bint.user);
        row.components[i].setDisabled(true);
        row.components[i].setStyle(ButtonStyle.Success);
      }

      if (bint.customId === startId || horses.every(h => h.ownerId !== null)) {
        cl.stop();
        return;
      }
      if (horses.some(h => h.customId !== null)) {
        row.components[4].setDisabled(false);
      }
      await int.editReply({ embeds: [getEmbed(true)], components: [row] });
    });
    cl.on("end", async coll => {
      if (!coll.size) return;

      await int.editReply({ components: [] });
      await Utils.sleep(3e3);

      const steelBallRun = async () => {
        for (let i = 0; i < horses.length; i++) {
          let speed = Utils.rng(1, 3);
          for (let j = 0; j < speed; j++) {
            horses[i].progress.unshift("💨");
          }
        }
        let isOver = horses.some(h => h.progress.length >= 20);
        if (!isOver) {
          await int.editReply({ embeds: [getEmbed()] });
          await Utils.sleep(Utils.rng(1.2e3, 1.6e3));
          return steelBallRun();
        } else {
          await int.editReply({ embeds: [getEmbed()] });
          return;
        }
      };

      await steelBallRun();

      let winnings = bet * 4;
      let ebd = getEmbed();
      let lengthSort = horses.sort(
        (a, b) => b.progress.length - a.progress.length
      );

      let winners: Horse[] = [lengthSort[0]];

      for (let i = 1; i < lengthSort.length; i++) {
        if (lengthSort[i].progress.length === lengthSort[0].progress.length) {
          winners.push(lengthSort[i]);
        }
      }

      ebd.setTitle(winners.map(h => h.name).join(", ") + " won!");
      winners = winners.filter(w => w.ownerId !== null);

      await int.editReply({ embeds: [ebd] });
      await int.channel.send({
        content: winners
          .map(h => `<@${h.ownerId}> won \`${winnings}\` chips! ${CHIPS_EMOJI}`)
          .join("\n")
      });

      for (let i = 0; i < winners.length; i++) {
        await Utils.editWins(winners[i].ownerId);
        await Utils.editChips(winners[i].ownerId, winnings);
      }
    });
  }
});
