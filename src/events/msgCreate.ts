import { Event } from "../typings";
import { client } from "..";
import { misc, sqlite } from "../utils";

const MsgCreate: Event<"messageCreate"> = {
  name: "messageCreate",
  exe: async (msg) => {
    if (!msg.content.startsWith(client.prefix) || msg.author.bot) return;
    let args = msg.content.slice(client.prefix.length).split(/ +/);
    let cmdName = args.shift().toLowerCase();
    let cmd =
      client.msgCommands.get(cmdName) ||
      client.msgCommands.find((c) => c.aliases && c.aliases.includes(cmdName));
    if (!cmd) return;
    let cd = await misc.checkCD(msg.author.id, client, cmd.name, msg);
    if (!cd) return;
    let freeTables = await misc.checkForTables(
      msg.author.id,
      client,
      cmd.name,
      msg
    );
    if (!freeTables) return;
    let pl = await sqlite.checkDB(msg.author.id, msg.author.username, true);
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
      if (cmd.cd) {
        let sTime = Date.now() + cmd.cd;
        client.cds[msg.author.id][cmd.name] = sTime;
      }
    } catch (e) {
      console.warn(e);
    }
  },
};

export { MsgCreate };
