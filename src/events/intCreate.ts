import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "..";
import { Event } from "../typings";
import { sqlite, misc } from "../utils";

const IntCreate: Event<"interactionCreate"> = {
  name: "interactionCreate",
  exe: async (int) => {
    if (int.isCommand()) {
      let cmd = client.intCommands.get(int.commandName);
      let freeTables = await misc.checkForTables(
        int.user.id,
        client,
        cmd.name,
        int
      );
      if (!freeTables) return;
      let pl = await sqlite.checkDB(int.user.id, int.user.username, true);
      await cmd.exe({
        int,
        args: int.options as CommandInteractionOptionResolver,
        client,
        authorID: int.user.id,
        username: int.user.username,
        pl,
      });
    }
  },
};

export { IntCreate };
