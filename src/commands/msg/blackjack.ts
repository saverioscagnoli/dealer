import { MsgCommand } from "../../typings";
import {
  EmbedAssets,
  Emojis,
  filters,
  math,
  misc,
  sleep,
  sqlite,
} from "../../utils";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const Blackjack: MsgCommand = {
  name: "blackjack",
  description: "Place a bet and play blackjack!",
  aliases: ["bj"],
  exe: async ({ msg, args, authorID, username, client }) => {
    if (client.tables.blackjack.includes(authorID)) {
      await msg.reply(
        "**You already requested a Blackjack table! Finish your match before starting another.**"
      );
      return;
    }
    let n = Number(args[0]);
    let valid = await sqlite.bet(authorID, n, msg);
    if (!valid) return;

    let jID = math.buttonID("join-bj");
    let sID = math.buttonID("start-bj");
    let joinRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      misc.Button({
        customID: jID,
        label: "Join!",
        style: ButtonStyle.Success,
      }),
      misc.Button({
        customID: sID,
        label: "Start Match!",
        style: ButtonStyle.Success,
      })
    );
    let { blackjack } = client.tables;
    let joinedName: string[] = [username];
    let joined: string[] = [authorID];
    blackjack.push(authorID);
    let ebd = misc.Embed({
      title: `Dealer is hosting Blackjack table no. **\`${blackjack.length}\`**! Requested by ${username}.`,
      desc: `In this table there are:\n**• ${joinedName.join("\n• ")}**`,
      footer: {
        text: `Players: ${joinedName.length}/6`,
        iconURL: EmbedAssets.ProPic,
      },
    });

    let botMsg = await msg.channel.send({
      embeds: [ebd],
      components: [joinRow],
    });
    let cl = msg.channel.createMessageComponentCollector({
      filter: filters.join(jID, sID, n, joined),
      idle: 60e3,
      max: 5,
    });
    cl.on("collect", async btnInt => {
      await btnInt.deferUpdate();
      if (btnInt.customId === jID) {
        joinedName.push(btnInt.user.username);
        ebd.setDescription(
          `In this table there are:\n**• ${joinedName.join("\n• ")}**`
        );
        ebd.setFooter({
          text: `Players: ${joinedName.length}/6`,
          iconURL: EmbedAssets.ProPic,
        });
        await botMsg.edit({
          embeds: [ebd],
          components: [joinRow],
        });
      } else cl.stop();
    });
    cl.on("end", async coll => {
      if (coll.size === 5) await sleep(1.5);
      let hID = math.buttonID("hit");
      let sID = math.buttonID("stand");
      let dID = math.buttonID("double");

      let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        misc.Button({
          customID: hID,
          label: "Hit",
          style: ButtonStyle.Secondary,
        }),
        misc.Button({
          customID: sID,
          label: "Stand",
          style: ButtonStyle.Secondary,
        }),
        misc.Button({
          customID: dID,
          label: "Double (x2)",
          style: ButtonStyle.Danger,
        })
      );
      let deck = misc.createDeck();
      let pHands: any[][] = [];
      let dHand = [];
      for (let i = 0; i < joinedName.length; i++) {
        pHands.push([]);
        for (let j = 0; j < 2; j++) {
          misc.draw(deck, pHands[i]);
        }
      }
      for (let i = 0; i < 2; i++) {
        misc.draw(deck, dHand);
      }
      let ebd = misc.Embed({
        title: `It's ${joinedName[0]}'s turn!`,
        fields: misc.displayHandsBJ(joinedName, pHands, dHand),
      });
      await botMsg.edit({
        embeds: [ebd],
        components: [row],
      });
      let joinedCopy = [...joined];
      let cl = msg.channel.createMessageComponentCollector({
        filter: filters.blackjack([hID, sID, dID], joined, joinedCopy),
        idle: 1.8e5,
        dispose: true,
      });
      let whoDoubled = [];
      let i = 0;
      cl.on("collect", async btnInt => {
        await btnInt.deferUpdate();
        if (btnInt.customId === hID || btnInt.customId === dID) {
          misc.draw(deck, pHands[i]);
          let sum = math.sum(pHands[i].map(c => c.value));
          if (btnInt.customId === hID) {
            row.components[2].setDisabled(true);
            if (sum >= 21) {
              if (joined.length === 1) {
                cl.stop();
              } else {
                joined.shift();
                i++;
                ebd.setTitle(`It's ${joinedName[i]}'s turn!`);
                row.components[2].setDisabled(false);
              }
            }
          } else {
            whoDoubled.push(btnInt.user.id);
            if (joined.length === 1) {
              cl.stop();
            } else {
              joined.shift();
              i++;
              ebd.setTitle(`It's ${joinedName[i]}'s turn!`);
            }
          }
          ebd.setFields(misc.displayHandsBJ(joinedName, pHands, dHand));
        } else {
          if (joined.length === 1) {
            cl.stop();
            ebd.setFields(
              misc.displayHandsBJ(joinedName, pHands, dHand, i, true)
            );
          } else {
            joined.shift();
            ebd.setFields(
              misc.displayHandsBJ(joinedName, pHands, dHand, i, true)
            );
            i++;
            ebd.setTitle(`It's ${joinedName[i]}'s turn!`);
            row.components[2].setDisabled(false);
          }
        }
        await botMsg.edit({
          embeds: [ebd],
          components: [row],
        });
      });

      cl.on("end", async coll => {
        await sleep(1.5);
        ebd.setTitle("All the players made their move!");
        await botMsg.edit({
          embeds: [ebd],
          components: [],
        });
        await sleep(2);
        ebd.setTitle(`The dealer's secret card was **\`${dHand[1].card}\`**!`);
        ebd.setFields(
          misc.displayHandsBJ(joinedName, pHands, dHand, null, null, true)
        );
        await botMsg.edit({
          embeds: [ebd],
        });

        let dSum = math.sum(dHand.map(c => c.value));
        while (dSum < 17) {
          await sleep(2.5);
          misc.draw(deck, dHand);
          dSum = math.sum(dHand.map(c => c.value));
          ebd.setTitle(
            `**Dealer drew a \`${dHand[dHand.length - 1].card}\`!**`
          );
          ebd.setFields(
            misc.displayHandsBJ(joinedName, pHands, dHand, null, null, true)
          );
          await botMsg.edit({
            embeds: [ebd],
          });
        }
        let WorL = {};
        for (let i = 0; i < joinedCopy.length; i++) {
          let pSum = math.sum(pHands[i].map(c => c.value));
          if (pSum > dSum && pSum <= 21) {
            WorL[joinedCopy[i]] = "winner";
          } else if (dSum > pSum && dSum <= 21) {
            WorL[joinedCopy[i]] = "loser";
          } else if (pSum > 21) {
            WorL[joinedCopy[i]] = "loser";
          } else if (dSum > 21 && pSum <= 21) {
            WorL[joinedCopy[i]] = "winner";
          } else if (pSum == dSum) {
            WorL[joinedCopy[i]] = "push";
          }
        }
        let formattedWin: string[] = [];
        for (let i = 0; i < joinedCopy.length; i++) {
          if (WorL[joinedCopy[i]] === "winner") {
            await sqlite.update(
              joinedCopy[i],
              "chips",
              whoDoubled.includes(joinedCopy[i]) ? n * 4 : n * 2
            );
            formattedWin.push(
              `**${joinedName[i]} won \`${
                whoDoubled.includes(joinedCopy) ? n * 2 + "  (x2)" : n * 2
              }\` chips!** ${Emojis.Chips}`
            );
            await sqlite.updWL(joinedCopy[i], "wins");
          } else if (WorL[i] === "push") {
            formattedWin.push(`**It's a push, ${joinedName[i]}!**`);
            await sqlite.update(joinedCopy[i], "chips", n);
          } else {
            formattedWin.push(
              `**${joinedName[i]} lost \`${n}\` chips!** ${Emojis.Chips}`
            );
            await sqlite.updWL(joinedCopy[i], "losses");
          }
        }
        blackjack.splice(blackjack.indexOf(authorID));
        ebd.setTitle("The game is over!");
        ebd.setDescription(`• ${formattedWin.join("\n• ")}`);
        await sleep(2);
        await botMsg.edit({
          embeds: [ebd],
        });
        await botMsg.react(Emojis.GG);
      });
    });
  },
};

export { Blackjack };
