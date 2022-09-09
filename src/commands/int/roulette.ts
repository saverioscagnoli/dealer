import { IntCommand } from "../../typings";
import { createCanvas } from "canvas";
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ApplicationCommandOptionType,
} from "discord.js";
import {
  EmbedAssets,
  Emojis,
  filters,
  math,
  misc,
  sleep,
  sqlite,
} from "../../utils";
const Roulette: IntCommand = {
  name: "roulette",
  description: "Play european roulette!",
  options: [
    {
      name: "bet",
      description: "How many chips you want to bet",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  exe: async ({ int, args, username, authorID, client }) => {
    let n = args.getInteger("bet");
    let valid = await sqlite.bet(authorID, n, int, false);
    if (!valid) return;

    let jID = math.buttonID("join-rl");
    let sID = math.buttonID("start-rl");
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      misc.Button({
        customID: jID,
        label: "Join!",
        style: ButtonStyle.Success,
      }),
      misc.Button({
        customID: sID,
        label: "Start Game!",
        style: ButtonStyle.Success,
      })
    );
    let joinedName: string[] = [username];
    let joined: string[] = [authorID];
    let { roulette } = client.tables;
    roulette.push(authorID);
    let ebd = misc.Embed({
      title: `Dealer is hosting Roulette table no. **\`${roulette.length}\`**! Requested by ${username}.\nThe bet is **\`${n}\`** chips! ${Emojis.Chips}`,
      desc: `In this table there are:\n**• ${joinedName.join("\n• ")}**`,
      footer: {
        text: `Players: ${joinedName.length}/6`,
        iconURL: EmbedAssets.ProPic,
      },
    });

    await int.reply({
      embeds: [ebd],
      components: [row],
    });
    let cl = int.channel.createMessageComponentCollector({
      filter: filters.join(jID, sID, n, joined),
      idle: 60e3,
      max: 5,
    });
    cl.on("collect", async (btnInt) => {
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
        await int.editReply({
          embeds: [ebd],
          components: [row],
        });
      } else cl.stop();
    });
    cl.on("end", async (coll) => {
      if (coll.size === 5) await sleep(1.5);
      let fCol = [];
      let sCol = [];
      for (let i = 1; i <= 36; i += 3) {
        fCol.push(i);
        sCol.push(i + 1);
      }
      let betNames = [
        { name: "1st Twelves", id: math.buttonID("1st12") },
        { name: "2nd Twelves", id: math.buttonID("2nd12") },
        { name: "3rd Twelves", id: math.buttonID("3rd12") },
        { name: "1 to 18", id: math.buttonID("1to18") },
        { name: "1st Column", id: math.buttonID("1stCol") },
        { name: "2nd Column", id: math.buttonID("2ndCol") },
        { name: "3rd Column", id: math.buttonID("3rdCol") },
        { name: "19 to 36", id: math.buttonID("19to36") },
        { name: "Even", id: math.buttonID("even") },
        { name: "Odd", id: math.buttonID("odd") },
        { name: "Red", id: math.buttonID("red") },
        { name: "Black", id: "black" },
        { name: "0", id: math.buttonID("0") },
      ];
      let rows: ActionRowBuilder<ButtonBuilder>[] = [];
      for (let i = 0; i < betNames.length; i++) {
        if (i % 4 == 0) {
          rows.push(new ActionRowBuilder<ButtonBuilder>());
        }
        if (i <= 3) {
          rows[0].addComponents(
            misc.Button({
              customID: betNames[i].id,
              label: betNames[i].name,
              style: ButtonStyle.Secondary,
            })
          );
        } else if (i <= 7) {
          rows[1].addComponents(
            misc.Button({
              customID: betNames[i].id,
              label: betNames[i].name,
              style: ButtonStyle.Secondary,
            })
          );
        } else {
          rows[2].addComponents(
            misc.Button({
              customID: betNames[i].id,
              label: betNames[i].name,
              style: ButtonStyle.Secondary,
            })
          );
        }
      }
      let readyID = math.buttonID("ready");
      let resetID = math.buttonID("reset");
      rows[3] = new ActionRowBuilder<ButtonBuilder>().addComponents(
        misc.Button({
          customID: resetID,
          label: "Reset bets",
          style: ButtonStyle.Danger,
        }),
        misc.Button({
          customID: readyID,
          label: "Ready!",
          style: ButtonStyle.Success,
        })
      );
      let uBets = {};
      for (let i = 0; i < joined.length; i++) {
        uBets[joined[i]] = {
          name: joinedName[i],
          tot: 0,
          n: 0,
          bets: [],
          wins: [],
          losses: [],
        };
      }
      let ebd = misc.Embed({
        title: `Place your bets, people! Every bet is **\`${n}\`** chips! ${Emojis.Chips}`,
        image: EmbedAssets.RouletteBets,
        fields: misc.displayBetsRL(joinedName, joined, uBets),
        footer: {
          text: `Players ready: 0/${joined.length}`,
          iconURL: EmbedAssets.ProPic,
        },
      });
      await int.editReply({
        embeds: [ebd],
        components: rows,
      });
      let ids = betNames.map((b) => b.id);
      ids.push(resetID);
      ids.push(readyID);
      let readys: string[] = [];
      let cl = int.channel.createMessageComponentCollector({
        filter: filters.roulette(ids, joined, uBets, readys),
        idle: 6e4,
        componentType: ComponentType.Button,
      });
      cl.on("collect", async (btnInt) => {
        if (btnInt.customId === readyID) {
          await btnInt.deferUpdate();
          readys.push(btnInt.user.id);
          if (readys.length === joinedName.length) cl.stop();
        } else if (btnInt.customId === resetID) {
          await btnInt.deferUpdate();
          readys.splice(readys.indexOf(btnInt.user.id), 1);
          sqlite.update(btnInt.user.id, "chips", uBets[btnInt.user.id].n);
          uBets[btnInt.user.id].bets = [];
          uBets[btnInt.user.id].n = 0;
        } else {
          let valid = await sqlite.bet(btnInt.user.id, n, btnInt);
          if (valid) {
            uBets[btnInt.user.id].bets.push(btnInt.component.label);
            uBets[btnInt.user.id].n += n;
            await btnInt.deferUpdate();
          }
        }
        ebd.setFields(misc.displayBetsRL(joinedName, joined, uBets));
        ebd.setFooter({
          text: `Players ready: ${readys.length}/${joined.length}`,
          iconURL: EmbedAssets.ProPic,
        });
        await int.editReply({
          embeds: [ebd],
          components: rows,
        });
      });
      cl.on("end", async (coll) => {
        await sleep(1.5);
        ebd.setTitle("Everyone placed their bets!");
        await int.editReply({
          embeds: [ebd],
          components: [],
        });
        if (coll.size === 0) return;
        await sleep(3);
        ebd.setImage(EmbedAssets.RouletteSpinning);
        await int.editReply({
          embeds: [ebd],
        });
        let rWheel = misc.rouletteWheel();
        let picked = math.pick(rWheel);
        let winners = [];
        if (picked.value <= 12) {
          winners.push("1st Twelves");
        } else if (picked.value <= 24) {
          winners.push("2nd Twelves");
        } else {
          winners.push("3rd Twelves");
        }
        if (picked.value <= 18) {
          winners.push("1 to 18");
        } else {
          winners.push("19 to 36");
        }
        if (picked.value % 2 === 0) {
          winners.push("Even");
        } else {
          winners.push("Odd");
        }
        if (picked.color === "🔴") {
          winners.push("Red");
        } else if (picked.color === "⚫") {
          winners.push("Black");
        } else {
          winners.push("0");
        }
        await sleep(math.rng(2.7, 3, true));
        let canvas = createCanvas(200, 90);
        let ctx = canvas.getContext("2d");
        ctx.font = "50px Arial";
        ctx.fillStyle =
          picked.color == "🔴"
            ? "#FF0000"
            : picked.color === "⚫"
            ? "#000000"
            : "#00FF00";
        ctx.fillText(`${picked.color} ${picked.value}`, 10, 55);
        let atc = new AttachmentBuilder(canvas.createPNGStream(), {
          name: "num.png",
        });
        ebd.setImage("attachment://num.png");
        let fields = [];
        let c = 0;
        for (let id in uBets) {
          for (let i = 0; i < uBets[id].bets.length; i++) {
            let bet = uBets[id].bets[i];
            if (winners.includes(bet)) {
              uBets[id].wins.push(bet);
            } else {
              uBets[id].losses.push(bet);
            }
          }
          fields.push({
            name: `${joinedName[c]}'s wins:`,
            value: `${
              uBets[joined[c]].wins.length === 0
                ? "Nothing!"
                : `• ${uBets[joined[c]].wins.join("\n• ")}`
            }`,
            inline: true,
          });
          fields.push({
            name: `${joinedName[c]}'s losses:`,
            value: `${
              uBets[joined[c]].losses.length === 0
                ? "Nothing!"
                : `• ${uBets[joined[c]].losses.join("\n• ")}`
            }`,
            inline: true,
          });
          c++;
          let wins = uBets[id].wins;
          for (let j = 0; j < wins.length; j++) {
            if (
              wins[j] === "1st Twelves" ||
              wins[j] === "2nd Twelves" ||
              wins[j] === "3rd Twelves" ||
              wins[j] === "1st Column" ||
              wins[j] === "2nd Column" ||
              wins[j] === "3rd Column"
            ) {
              uBets[id].tot += n * 3;
            } else if (wins[j] === "0") {
              uBets[id].tot += n * 36;
            } else {
              uBets[id].tot += n * 2;
            }
          }
          fields.push({
            name: `Chips:`,
            value: `You won **\`${uBets[id].tot.toLocaleString()}\`** chips! ${
              Emojis.Chips
            }`,
            inline: true,
          });
          await sqlite.update(id, "chips", uBets[id].tot);
        }
        ebd.setTitle(`The number was **\`${picked.color} ${picked.value}\`**!`);
        ebd.setFields(fields);
        roulette.splice(roulette.indexOf(authorID));
        await int.editReply({
          embeds: [ebd],
          files: [atc],
        });
      });
    });
  },
};

export { Roulette };
