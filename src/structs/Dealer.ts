import {
  CacheType,
  Client,
  Collection,
  CommandInteractionOptionResolver,
  Interaction,
  Routes
} from "discord.js";
import { SlashCommandT, Interaction as ExtendedInteraction } from "../types";
import { QuickDB } from "quick.db";
import { CDS_PATH, CHIPS_PATH, COMMANDS_DIR } from "../utils";
import { SlashCommand } from "./SlashCommand";
import { readdirSync } from "fs";

export class Dealer extends Client {
  public static commands: Collection<string, SlashCommandT> = new Collection();
  public static profData: QuickDB = new QuickDB({ filePath: CHIPS_PATH });
  public static cds: QuickDB = new QuickDB({ filePath: CDS_PATH });

  constructor({ intents }) {
    super({ intents });
    this.build();
  }

  private build() {
    this.buildCommands().then(cmds => this.deploy(cmds));
    this.listen();
    this.login(process.env.TOKEN);
  }

  private async buildCommands() {
    let cmds: SlashCommand[] = [];
    let folder = readdirSync(COMMANDS_DIR);
    for (let file of folder) {
      let module = await import(COMMANDS_DIR + file);
      let cmd: SlashCommand = module.default;
      if (!cmd.name) return;
      cmds.push(cmd);
      Dealer.commands.set(cmd.name, cmd);
    }
    return cmds;
  }

  private async deploy(cmds: SlashCommand[]) {
    this.rest.setToken(process.env.TOKEN);
    try {
      let req = (await this.rest.put(
        process.env.GUILD_ID
          ? Routes.applicationGuildCommands(
              process.env.CLIENT_ID,
              process.env.GUILD_ID
            )
          : Routes.applicationCommands(process.env.CLIENT_ID),
        {
          body: cmds
        }
      )) as SlashCommand[];
      console.log(`Loaded ${req.length} (/) commands.`);
    } catch (err) {
      console.log(err);
    }
  }

  private listen() {
    this.on("ready", this.onReady);
    this.on("interactionCreate", this.onInteractionCreate);
  }

  private onReady() {
    console.log(`Logged in as ${this.user.tag}.`);
  }

  private async onInteractionCreate(int: Interaction<CacheType>) {
    if (!int.isCommand()) return;
    let cmd = Dealer.commands.get(int.commandName);
    if (!cmd) return;

    try {
      cmd.exe({
        client: this,
        int: int as ExtendedInteraction,
        args: int.options as CommandInteractionOptionResolver
      });
    } catch (err) {
      console.error(err);
    }
  }
}
