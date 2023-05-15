import { ApplicationCommandOptionType } from "discord.js";
import { SlashCommand } from "../structs";
import { Utils } from "../utils";

export default new SlashCommand({
  name: "roll",
  description: "Roll any and as many dice as you want!",
  options: [
    {
      name: "sides",
      description: "The number of sides on the dice.",
      type: ApplicationCommandOptionType.Integer,
      required: true
    },
    {
      name: "rolls",
      description: "The number of dice to roll.",
      type: ApplicationCommandOptionType.Integer,
      required: false
    }
  ],
  exe: async ({ int, args }) => {
    let s = args.getInteger("sides");
    let n = args.getInteger("rolls") || 1;

    if (s < 1) {
      await int.reply({
        content: "The number of sides must be greater than 0.",
        ephemeral: true
      });
      return;
    }
    if (s > 100) {
      await int.reply({
        content: "The number of sides must be less or equal than 100.",
        ephemeral: true
      });
      return;
    }
    if (n < 1) {
      await int.reply({
        content: "The number of rolls must be greater than 0.",
        ephemeral: true
      });
      return;
    }
    if (n > 20) {
      await int.reply({
        content: "The number of rolls must be less or equal than 20.",
        ephemeral: true
      });
      return;
    }

    let rolls = [];
    for (let i = 0; i < n; i++) {
      rolls.push(Utils.rng(1, s));
    }
    let ebd = Utils.embed({
      description:
        rolls.length === 1
          ? `You rolled a \`${rolls[0]}\`!`
          : `You rolled: 
            \`${rolls.join("`\n`")}\`\n for a toal of \`${rolls.reduce(
              (a, b) => a + b
            )}\`!`
    });

    await int.reply({ embeds: [ebd] });
  }
});
