import {
  Client as DiscordClient,
  Routes,
  type ClientEvents,
  type ClientOptions
} from "discord.js";
import fs from "fs/promises";
import path from "path";
import { Event } from "~/core/event";
import type { SlashCommand } from "~/core/slash-command";
import { table } from "~/lib/log";

class Client extends DiscordClient {
  private static instance: Client;

  public commands: Map<string, SlashCommand>;

  public static build(options: ClientOptions) {
    if (!this.instance) {
      this.instance = new Client(options);
    }

    return this.instance;
  }

  private constructor(options: ClientOptions) {
    super(options);

    this.commands = new Map();
    this.rest.setToken(process.env.TOKEN);
  }

  public async init() {
    let commands = await this.loadCommands();

    await this.loadEvents();
    await this.deploy(commands);
  }

  private async loadCommands(): Promise<SlashCommand[]> {
    let commands: SlashCommand[] = [];

    let commandFolder = path.join(__dirname, "..", "commands");
    let commandFiles = await fs.readdir(commandFolder);

    for (let file of commandFiles) {
      let module = await import(path.join(commandFolder, file));
      let command = module.default as SlashCommand;

      commands.push(command);
      this.commands.set(command.name, command);
    }

    return commands;
  }

  private async loadEvents() {
    let events = [];

    let eventFolder = path.join(__dirname, "..", "events");
    let eventFiles = await fs.readdir(eventFolder);

    for (let file of eventFiles) {
      let module = await import(path.join(eventFolder, file));
      let event = module.default as Event<keyof ClientEvents>;

      this.on(event.name, event.callback);
      events.push(event.name);
    }

    console.log("Events:");
    table(events.map(e => ({ name: e, status: "✅" })));
  }

  private async deploy(commands: SlashCommand[]) {
    try {
      await this.rest.put(
        process.env.GUILD_ID
          ? Routes.applicationGuildCommands(
              process.env.CLIENT_ID,
              process.env.GUILD_ID
            )
          : Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
    } catch (err) {
      console.error(err);
    }

    console.log("Commands:");
    table(commands.map(c => ({ name: c.name, status: "✅" })));
  }
}

export { Client };
