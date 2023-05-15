import { readdirSync } from "fs";
import { SlashCommand } from "../structs";
import { CHIPS_EMOJI, DAILY_IMG, Utils } from "../utils";
import { AttachmentBuilder } from "discord.js";

export default new SlashCommand({
  name: "hourly",
  description: "Hourly dose of chips!",
  cd: 3.6e6,
  exe: async ({ int }) => {
    let n = Utils.rng(Utils.rng(1e3, 2e3), Utils.rng(2.3e3, 3.3e3));
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
