import {
  Client,
  Collection,
  ApplicationCommandDataResolvable,
  REST,
  Routes,
} from "discord.js";
import { QuickDB } from "quick.db";
import * as MsgCmdFiles from "../commands/msg";
import * as IntCmdFiles from "../commands/int";
import * as EvtFiles from "../events";
import { IntCommand } from "./IntCommand";
import { MsgCommand } from "./MsgCommand";
import { Tables } from "./Tables";

class DealerClient extends Client {
  prefix = "deal ";
  msgCommands: Collection<string, MsgCommand> = new Collection();
  intCommands: Collection<string, IntCommand> = new Collection();
  db: QuickDB = new QuickDB({ filePath: "chips.sqlite" });
  tables: Tables = {
    coinflip: [],
    horserace: [],
    blackjack: [],
    roulette: [],
  };
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
  async init() {
    for (let i in MsgCmdFiles) {
      let cmd = MsgCmdFiles[i as keyof typeof MsgCmdFiles];
      this.msgCommands.set(cmd.name, cmd);
    }
    let slashCommands: ApplicationCommandDataResolvable[] = [];
    for (let j in IntCmdFiles) {
      let cmd = IntCmdFiles[j as keyof typeof IntCmdFiles];
      this.intCommands.set(cmd.name, cmd);
      slashCommands.push(cmd);
    }

    for (let k in EvtFiles) {
      let evt = EvtFiles[k as keyof typeof EvtFiles];
      this.on(evt.name, evt.exe);
    }

    let rest = new REST().setToken(process.env.TOKEN);
    try {
      console.log(
        `Started refreshing ${slashCommands.length} application (/) commands.`
      );
      let data: any = await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: slashCommands }
      );
      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (e) {
      console.error(e);
    }
  }
}

export { DealerClient };
