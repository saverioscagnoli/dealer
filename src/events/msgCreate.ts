import { Event } from "../typings";
import { client } from "..";
import { sqlite } from "../utils";

const MsgCreate: Event<"messageCreate"> = {
  name: "messageCreate",
  exe: async msg => {
    if (!msg.content.startsWith(client.prefix) || msg.author.bot) return;
    let args = msg.content.slice(client.prefix.length).split(/ +/);
    let cmdName = args.shift().toLowerCase();
    let cmd =
      client.msgCommands.get(cmdName) ||
      client.msgCommands.find(c => c.aliases && c.aliases.includes(cmdName));
    let pl = await sqlite.checkDB(msg.author.id, msg.author.username, true);
    if (!cmd) return;
    try {
      await msg.channel.sendTyping();
      await cmd.exe({
        msg,
        args,
        client,
        authorID: msg.author.id,
        username: msg.author.username,
        pl,
      });
    } catch (e) {
      console.warn(e);
    }
  },
};

export { MsgCreate };
