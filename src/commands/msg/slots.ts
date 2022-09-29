import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { SlotMachine, SlotSymbol } from "slot-machine";
import { MsgCommand } from "../../typings";
import { Emojis, filters, math, misc } from "../../utils";

const Slots: MsgCommand = {
  name: "slots",
  description: "Play slots! (each roll is 50 chips)",
  aliases: ["sl", "slotmachine"],
  exe: async ({ msg, authorID }) => {
    let symbols = [
      new SlotSymbol("cherry", {
        display: "🍒",
        points: 10,
        weight: math.rng(60, 67),
      }),
      new SlotSymbol("money", {
        display: "💰",
        points: 20000,
        weight: math.rng(30, 35),
      }),
      new SlotSymbol("wild", {
        display: "❔",
        points: 2000,
        weight: math.rng(40, 45),
        wildcard: true,
      }),
      new SlotSymbol("pumpkin", {
        display: "🎃",
        points: 2000,
        weight: math.rng(45, 55),
      }),
      new SlotSymbol("poop", {
        display: "💩",
        points: 50,
        weight: math.rng(60, 65),
      }),
      new SlotSymbol("unicorn", {
        display: "🦄",
        points: 2500,
        weight: math.rng(45, 55),
      }),
      new SlotSymbol("moon", {
        display: "🌝",
        points: 4000,
        weight: math.rng(40, 45),
      }),
    ];
    let slot = new SlotMachine(5, symbols);
    let id = math.buttonID("roll");
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      misc.Button({
        customID: id,
        label: "📍",
        style: ButtonStyle.Success,
      })
    );
    let botMsg = await msg.channel.send({
      content: `**Every roll is 50 ${Emojis.Chips}! Click 📍 to start!**`,
      components: [row],
    });
    let cl = msg.channel.createMessageComponentCollector({
      filter: filters.slots(id, authorID),
      idle: 6e4,
      componentType: ComponentType.Button,
    });
    cl.on("collect", async (btnInt) => {
      await btnInt.deferUpdate();
      let result = slot.play();
      await botMsg.edit(result.visualize());
    });
  },
};

export { Slots };
