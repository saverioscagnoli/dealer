import { MsgCommand } from "../../typings";
import { Emojis, math, sqlite } from "../../utils";

const Chips: MsgCommand = {
  name: "chips",
  description: "Get your daily dose of chips!",
  cd: 8.64e7,
  exe: async ({ msg, authorID }) => {
    let n = math.rng(math.rng(1000, 1500), math.rng(2000, 4500));
    await sqlite.update(authorID, "chips", n);
    await msg.channel.send(`You got **\`${n}\`** chips! ${Emojis.Chips}`);
  },
};

export { Chips };
