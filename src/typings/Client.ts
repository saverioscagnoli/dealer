import { Client, Collection } from "discord.js";
import * as MsgCmdFiles from "../commands/msg";
import * as EvtFiles from "../events";
import { MsgCommand } from "./MsgCommand";

class DealerClient extends Client {
  prefix: string = "deal ";
  msgCommands: Collection<string, MsgCommand> = new Collection();
  constructor() {
    super({
      intents: [
        "Guilds",
        "GuildMessages",
        "GuildMembers",
        "GuildMessageTyping",
        "GuildMessageReactions",
        "MessageContent",
      ],
    });
  }
  build() {
    this.login(process.env.TOKEN);
    this.init();
  }
  init() {
    for (let i in MsgCmdFiles) {
      let cmd = MsgCmdFiles[i as keyof typeof MsgCmdFiles];
      this.msgCommands.set(cmd.name, cmd);
    }

    for (let j in EvtFiles) {
      let evt = EvtFiles[j as keyof typeof EvtFiles];
      this.on(evt.name, evt.exe);
    }
  }
}

export { DealerClient };
