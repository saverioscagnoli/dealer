import { ActionRowBuilder, ComponentType, SelectMenuBuilder } from "discord.js";
import { MsgCommand } from "../../typings";
import { EmbedAssets, math, misc } from "../../utils";

const Help: MsgCommand = {
  name: "help",
  description: "Displays commands and their explanations",
  exe: async ({ msg, client }) => {
    let cmds = [...client.msgCommands.keys()];
    let options = [];
    for (let i = 0; i < cmds.length; i++) {
      options.push({ label: misc.capitalize(cmds[i]), value: cmds[i] });
    }
    let ebd = misc.Embed({
      title: "Please select a command!",
      desc: "**This is the help command. \nTo start, please select the command that you want info about using the selection menu below, and I will display anything you need to know!**",
      thumb: EmbedAssets.ProPicPixelArt,
    });
    let row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId(math.buttonID(`select`))
        .setPlaceholder("Select a command!")
        .setOptions(options)
    );
    let botMsg = await msg.channel.send({
      embeds: [ebd],
      components: [row],
    });
    let cl = msg.channel.createMessageComponentCollector({
      componentType: ComponentType.SelectMenu,
      idle: 6e4,
    });
    cl.on("collect", async (slInt) => {
      await slInt.deferUpdate();
      let opt = slInt.values[0];
      ebd.setTitle(misc.capitalize(opt));
      let desc = `${client.msgCommands.get(opt).description}\n\n`;
      let fields: { name: string; value: string; inline?: boolean }[] = [];
      switch (opt) {
        case "balance":
          fields = [
            { name: "**Arguments**", value: "**`None`**" },
            { name: "**Cooldown**", value: "**`None`**" },
            { name: "**Affects wallet?**", value: "**`No`**" },
            {
              name: "**Usage example(s)**",
              value: "**• `deal balance`\n• `/balance`**",
            },
          ];
          break;
        case "blackjack":
          fields = [
            {
              name: "**Arguments**",
              value: "**1 - `bet`: number (integer)\n\ndeal blackjack `bet`**",
            },
            { name: "**Cooldown**", value: "`10 seconds`" },
            { name: "**Affects wallet?**", value: "`Yes`" },
            {
              name: "**Usage example(s)**",
              value:
                "**• `deal blackjack 100`\n• `deal bj 250`\n• `/blackjack 140`**",
            },
          ];
          break;
        case "chips":
          fields = [
            { name: "**Arguments**", value: "**`None`**" },
            { name: "**Cooldown**", value: "**`24 hours`**" },
            {
              name: "**Affects wallet?**",
              value: "**• `deal chips`\n• `/chips`**",
            },
          ];
          break;
        case "coinflip":
          fields = [
            {
              name: "**Arguments**",
              value: "**1 - `bet`: number (integer)\n\ndeal coinflip `bet`**",
            },
            { name: "**Cooldown**", value: "**`10 seconds`**" },
            { name: "**Affects wallet?**", value: "**`Yes`**" },
            {
              name: "**Usage example(s)**",
              value:
                "**• `deal coinflip 100`\n• `deal cf 234`\n• `/coinflip 120`**",
            },
          ];
          break;
        case "horserace":
          fields = [
            {
              name: "**Arguments**",
              value: "**1 - `bet`: number (integer)\n\ndeal horserace`bet`**",
            },
            { name: "**Cooldown**", value: "**`10 seconds`**" },
            { name: "**Affects wallet?**", value: "**`Yes`**" },
            {
              name: "**Usage example(s)**",
              value:
                "**• `deal horserace 120`\n• `deal hr 500`\n• `/horserace 120`**",
            },
          ];
          break;
        case "ranking":
          fields = [
            { name: "**Arguments**", value: "**`None`**" },
            { name: "**Cooldown**", value: "**`None`**" },
            { name: "**Affects wallet?**", value: "**`No`**" },
            {
              name: "**Usage example(s)**",
              value: "**• `deal ranking`\n• `deal rank`\n• /ranking**",
            },
          ];
          break;
        case "roulette":
          fields = [
            {
              name: "**Arguments**",
              value: "**1 - `bet`: number (integer)\n\ndeal roulette`bet`**",
            },
            { name: "**Cooldown**", value: "**`10 seconds`**" },
            { name: "**Affects wallet?**", value: "**`Yes`**" },
            {
              name: "**Usage example(s)**",
              value:
                "**• `deal roulette 146`\n• `deal rl 235`\n• `/roulette 125`**",
            },
          ];
          break;
      }
      ebd.setDescription(desc);
      ebd.setFields(fields);
      await botMsg.edit({
        embeds: [ebd],
        components: [row],
      });
    });
  },
};

export { Help };
