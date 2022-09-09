import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "..";
import { Event } from "../typings";

const IntCreate: Event<"interactionCreate"> = {
  name: "interactionCreate",
  exe: async (int) => {
    if (int.isCommand()) {
      let cmd = client.intCommands.get(int.commandName);

      await cmd.exe({
        args: int.options as CommandInteractionOptionResolver,
        client,
        int,
      });
    }
  },
};

export { IntCreate };
