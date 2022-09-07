import { MsgCommand } from "../../typings";
import { Emojis, math, sqlite } from "../../utils";

const Chips: MsgCommand = {
  name: "chips",
  description: "Get some chips",
  cd: 10000,
  exe: async ({ msg, authorID }) => {
    let n = math.rng(200, 1000);
    await sqlite.update(authorID, "chips", n);
    await msg.channel.send(`You got **\`${n}\`** chips! ${Emojis.Chips}`);
  },
};

export { Chips };
