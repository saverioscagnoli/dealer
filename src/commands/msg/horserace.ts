import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { MsgCommand } from "../../typings";
import { Emojis, filters, Horse, math, misc, sleep, sqlite } from "../../utils";

const Horserace: MsgCommand = {
  name: "horserace",
  description: "Bet chips on a horse and watch him go!",
  aliases: ["hr"],
  exe: async ({ msg, args, username, authorID }) => {
    let n = Number(args[0]);
    let valid = await sqlite.bet(authorID, n, msg, false);
    if (!valid) return;

    let row = new ActionRowBuilder<ButtonBuilder>();
    let names: string[] = [
      "Ichabod",
      "Abaccus",
      "Rex",
      "Moriah",
      "Snow",
      "Morning Blossom",
      "Aida",
      "Percy",
      "Aidan",
      "Winston",
      "Aiko",
      "Sako",
      "Airborne",
      "Goldie",
      "Aitch",
    ];
    let horses: Horse[] = [];
    for (let i = 0; i < 4; i++) {
      let hNames = horses.map((h) => h.name);
      let h: Horse = {
        name: math.pick(names),
        owner: null,
        id: math.buttonID("horse"),
        position: [Emojis.Horse],
      };
      while (hNames.includes(h.name)) {
        h.name = math.pick(names);
      }
      row.addComponents(
        misc.Button({
          customID: h.id,
          label: h.name,
          style: ButtonStyle.Secondary,
        })
      );
      horses.push(h);
    }
    let sID = math.buttonID("start");
    let ids = horses.map((h) => h.id);
    ids.push(sID);
    row.addComponents(
      misc.Button({
        customID: sID,
        label: "Start!",
        style: ButtonStyle.Success,
        disabled: true,
      })
    );
    let ebd = misc.Embed({
      title: `${username} started a horse race! The bet is **\`${n.toLocaleString()}\`** chips! ${
        Emojis.Chips
      }`,
      desc: misc.displayHorses(horses),
    });
    let botMsg = await msg.channel.send({
      embeds: [ebd],
      components: [row],
    });
    let joined = [];
    let cl = msg.channel.createMessageComponentCollector({
      filter: filters.horseRace(ids, n, joined, sID, authorID),
      idle: 40e3,
      componentType: ComponentType.Button,
    });
    cl.on("collect", async (btnInt) => {
      await btnInt.deferUpdate();
      let comps = row.components;
      if (btnInt.customId !== sID) {
        comps[4].setDisabled(false);

        let i = ids.indexOf(btnInt.customId);
        comps[i].setDisabled(true);
        comps[i].setStyle(ButtonStyle.Success);

        horses[i].owner = btnInt.user;
        ebd.setDescription(misc.displayHorses(horses));
        await botMsg.edit({
          embeds: [ebd],
          components: [row],
        });
      } else cl.stop();
    });
    cl.on("end", async (coll) => {
      await botMsg.edit({
        embeds: [ebd],
        components: [],
      });
      if (coll.size == 0) return;
      for (let i = 3; i >= 1; i--) {
        ebd.setTitle(`Race starting in **\`${i}\`**...`);
        await botMsg.edit({
          embeds: [ebd],
        });
        await sleep(1);
      }
      ebd.setTitle("The race has started!");
      let lengths = horses.map(({ position }) => position.length);
      let i = lengths.indexOf(Math.max(...lengths));

      while (horses[i].position.length <= 20) {
        for (let i = 0; i < horses.length; i++) {
          let spd = math.rng(math.rng(1, 2), math.rng(2, 3));
          for (let j = 0; j < spd; j++) {
            if (horses[i].position.length > 1) {
              horses[i].position.unshift(Emojis.Invis);
            } else {
              horses[i].position.unshift(Emojis.Dash);
            }
          }
        }

        lengths = horses.map(({ position }) => position.length);
        i = lengths.indexOf(Math.max(...lengths));
        if (horses[i].position.length > 5) {
          ebd.setTitle(`**\`${horses[i].name}\`** has the lead!`);
        }
        ebd.setDescription(misc.displayHorses(horses));
        await botMsg.edit({
          embeds: [ebd],
        });
        await sleep(math.rng(1.5, 1.7, true));
      }
      let w: string[] = [];
      for (let i = 0; i < horses.length; i++) {
        if (horses[i].position.length > 20) {
          w.push(
            `**• \`${horses[i].name}\` won! - ${
              horses[i].owner
                ? `${horses[i].owner} won ${n * 4} chips! ${Emojis.Chips}`
                : "Nobody"
            }**`
          );
          if (horses[i].owner) {
            await sqlite.update(horses[i].owner.id, "chips", n * 4);
            await sqlite.updWL(horses[i].owner.id, "wins");
          }
        } else if (horses[i].owner) {
          await sqlite.updWL(horses[i].owner.id, "losses");
        }
      }
      ebd.setTitle("The race is over!");
      await botMsg.edit({
        content: `${w.join("\n")}`,
        embeds: [ebd],
      });
    });
  },
};

export { Horserace };
