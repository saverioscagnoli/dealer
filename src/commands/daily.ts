import { AttachmentBuilder } from "discord.js";
import { SlashCommand } from "../structs";
import { CHIPS_EMOJI, DAILY_IMG, Utils } from "../utils";
import { readdirSync } from "fs";

export default new SlashCommand({
  name: "daily",
  description: `Daily dose of chips!`,
  cd: 8.64e7,
  exe: async ({ int }) => {
    let n = Utils.rng(Utils.rng(7e3, 8e3), Utils.rng(9e3, 1.5e4));
    let imgs = readdirSync(DAILY_IMG);
    let img = new AttachmentBuilder(DAILY_IMG + Utils.pick(imgs), {
      name: "img.png"
    });
    let ebd = Utils.embed({
      title: `**You got \`${n.toLocaleString()}\` chips! ${CHIPS_EMOJI}**`,
      image: { url: "attachment://img.png" }
    });
    await int.reply({ embeds: [ebd], files: [img] });
    await Utils.editChips(int.user.id, n);
  }
});
