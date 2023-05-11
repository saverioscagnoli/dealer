import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle
} from "discord.js";
import { Player, SlashCommand } from "../structs";
import { Utils } from "../utils";
import { randomUUID } from "crypto";

export default new SlashCommand({
  name: "blackjack",
  description: "Get 21!",
  options: [
    {
      name: "bet",
      description: "The amount of chips you want to bet.",
      type: ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  exe: async ({ int, args, data, client }) => {
    let bet = args.getInteger("bet");
    let msg = await Utils.validateBet(bet, data.chips);
    if (typeof msg === "string") {
      await int.reply({ content: msg, ephemeral: true });
      return;
    }

    let [joinId, startId] = [randomUUID(), randomUUID()];
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        customId: joinId,
        label: "Join",
        style: ButtonStyle.Secondary
      }),
      new ButtonBuilder({
        customId: startId,
        label: "Start",
        style: ButtonStyle.Success
      })
    );
    let deck = Utils.blackjackDeck();
    let players = [new Player(int.user.id)];

    players[0].draw(deck);
    players[0].draw(deck);

    const updateEmbed = () =>
      Utils.embed({
        title: "Blackjack table!",
        description: `**-- Players --** \n${players
          .map(p => `<@${p.id}>`)
          .join("\n")}`
      });

    await int.reply({ embeds: [updateEmbed()], components: [row] });

    const filter = async (bint: ButtonInteraction<"cached">) => {
      const validate = () => {
        return Utils.validateBint([joinId, startId], bint.customId);
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
            content: "Only the person who used the command can start the game!",
            ephemeral: true
          });
          return false;
        }
        return true;
      };

      const notJoined = async () => {
        if (
          players.map(u => u.id).includes(bint.user.id) &&
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

    let matchCl = int.channel.createMessageComponentCollector({
      filter,
      idle: 6e4
    });
    matchCl.on("collect", async bint => {
      await bint.deferUpdate();

      if (bint.customId === startId) {
        matchCl.stop();
      } else {
        let p = new Player(bint.user.id);
        p.draw(deck);
        p.draw(deck);
        players.push(p);
        await int.editReply({ embeds: [updateEmbed()] });
      }
    });
    matchCl.on("end", async () => {
      let dealer = new Player(client.user.id);
      dealer.draw(deck);
      dealer.draw(deck);

      const embed = () => {
        const displayHand = (p: Player, over?: boolean) => {
          let str: string;
          if (p.id === client.user.id) {
            if (over) {
              str = p.hand.map(c => `${c.value}${c.suit}`).join(" ");
            } else {
              str = p.hand
                .map((c, i) => (i > 0 ? `?` : `${c.value}${c.suit}`))
                .join(" | ");
            }
          } else {
            str = p.hand.map(c => `${c.value}${c.suit}`).join(" ");
          }
          return str;
        };
        return Utils.embed({
          description: [
            `${client.user}\n${displayHand(dealer)}`,
            ...players.map(p => `<@${p.id}>\n${displayHand(p)}`)
          ].join("\n\n")
        });
      };

      await int.editReply({ embeds: [embed()] });
    });
  }
});
