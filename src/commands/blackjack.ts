import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ComponentType,
  InteractionCollector
} from "discord.js";
import { BlackjackPlayer, SlashCommand } from "../structs";
import { CHIPS_EMOJI, Utils } from "../utils";
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
    let msg = await Utils.validateBet(bet, data.chips, int.user.id);
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
    let players = [new BlackjackPlayer(int.user.id)];

    players[0].draw(deck);
    players[0].draw(deck);
    players[0].sum();

    let t = await Utils.addTable("blackjack");

    const joinEmbed = () =>
      Utils.embed({
        title: `Blackjack table no. \`${t.toLocaleString()}\`!`,
        description: `**-- Players --** \n${players
          .map(p => `<@${p.id}>`)
          .join("\n")}`,
        footer: { text: `The bet is ${bet} chips!` }
      });

    await int.reply({ embeds: [joinEmbed()], components: [row] });

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
        let p = new BlackjackPlayer(bint.user.id);
        p.draw(deck);
        p.draw(deck);
        p.sum();
        players.push(p);
        await int.editReply({ embeds: [joinEmbed()] });
      }
    });
    matchCl.on("end", async () => {
      let dealer = new BlackjackPlayer(client.user.id);
      dealer.draw(deck);
      dealer.draw(deck);
      dealer.sum();
      players.unshift(dealer);
      let customIds = [randomUUID(), randomUUID(), randomUUID()];
      let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder({
          customId: customIds[0],
          label: "Hit",
          style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
          customId: customIds[1],
          label: "Stand",
          style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
          customId: customIds[2],
          label: "x2",
          style: ButtonStyle.Danger
        })
      );

      const filter = async (bint: ButtonInteraction<"cached">) => {
        const validate = () => Utils.validateBint(customIds, bint.customId);
        const isTurn = async () => {
          if (bint.user.id !== turn) {
            await bint.reply({
              content: "It's not your turn!",
              ephemeral: true
            });
            return false;
          }
          return true;
        };

        return validate() && (await isTurn());
      };

      let cl = int.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button
      });

      let turn = players[1].id;

      const displayHand = (p: BlackjackPlayer) => {
        const { id, hand, score, bust } = p;
        let str = `${hand.map(c => c.value + c.suit).join(" ")} → \`${score}\``;

        if (id === dealer.id && !cl.ended) {
          str = `${hand[0].value + hand[0].suit} ? → \`?\``;
        }

        return [
          `<@${id}> ${id === turn ? "◀" : ""} ${bust ? " Bust!" : ""}`,
          str
        ].join("\n");
      };

      const embed = () => {
        return Utils.embed({
          description: players.map(p => displayHand(p)).join("\n\n")
        });
      };

      await int.editReply({ embeds: [embed()], components: [row] });

      const skip = (
        cl: InteractionCollector<ButtonInteraction<CacheType>>,
        pi: number
      ) => {
        if (pi === players.length - 1) {
          turn = players[0].id;
          cl.stop();
        } else {
          turn = players[pi + 1].id;
        }
      };

      cl.on("collect", async bint => {
        await bint.deferUpdate();
        let pi = players.findIndex(p => p.id === turn);
        let p = players[pi];
        switch (bint.customId) {
          case customIds[0]: {
            p.draw(deck);
            p.sum();
            if (p.bust) skip(cl, pi);
            break;
          }
          case customIds[1]: {
            skip(cl, pi);
            break;
          }
        }
        await int.editReply({ embeds: [embed()] });
      });
      cl.on("end", async () => {
        await Utils.sleep(2e3);
        await int.editReply({ embeds: [embed()], components: [] });

        while (dealer.score < 17) {
          dealer.draw(deck);
          dealer.sum();
          await Utils.sleep(2e3);
          await int.editReply({ embeds: [embed()], components: [] });
        }

        await Utils.sleep(2e3);

        let winnings = Math.ceil(bet * 1.5);
        let wins = [];

        for (let p of players) {
          if (p.checkWin(dealer.score)) {
            wins.push(p.id);
            Utils.editChips(p.id, winnings);
          }
        }

        let content = wins.length
          ? wins
              .map(
                w =>
                  `<@${w}> **won \`${winnings.toLocaleString()}\`** ${CHIPS_EMOJI}!`
              )
              .join("\n")
          : "**No one won!**";

        await int.editReply({ content });
        await Utils.removeTable("blackjack");
      });
    });
  }
});
