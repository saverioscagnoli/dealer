import { Event } from "../typings";
import { client } from "..";

const MsgCreate: Event<"messageCreate"> = {
  name: "messageCreate",
  exe: async msg => {
    if (!msg.content.startsWith(client.prefix) || msg.author.bot) return;
    let args = msg.content.slice(client.prefix.length).split(/ +/);
    let cmdName = args.shift().toLowerCase();
    let cmd =
      client.msgCommands.get(cmdName) ||
      client.msgCommands.find(c => c.aliases && c.aliases.includes(cmdName));
    if (!cmd) return;
    try {
      await msg.channel.sendTyping();
      await cmd.exe({
        msg,
        args,
        client,
        userID: msg.author.id,
        username: msg.author.username,
      });
    } catch (e) {
      console.warn(e);
    }
  },
};

export { MsgCreate };
