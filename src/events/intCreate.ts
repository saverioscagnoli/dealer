import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "..";
import { Event } from "../typings";
import { sqlite, misc } from "../utils";

const IntCreate: Event<"interactionCreate"> = {
  name: "interactionCreate",
  exe: async (int) => {
    if (int.isCommand()) {
      let cmd = client.intCommands.get(int.commandName);
      let cd = await misc.checkCD(int.user.id, client, cmd.name, int);
      if (!cd) return;
      let freeTables = await misc.checkForTables(
        int.user.id,
        client,
        cmd.name,
        int
      );
      if (!freeTables) return;
      let pl = await sqlite.checkDB(int.user.id, int.user.username, true);
      try {
        await cmd.exe({
          int,
          args: int.options as CommandInteractionOptionResolver,
          client,
          authorID: int.user.id,
          username: int.user.username,
          pl,
        });
        if (cmd.cd) {
          let sTime = Date.now() + cmd.cd;
          client.cds[int.user.id][cmd.name] = sTime;
        }
      } catch (e) {
        console.warn(e);
      }
    }
  },
};

export { IntCreate };
