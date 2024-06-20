import type {
  ApplicationCommandOptionData,
  CommandInteraction
} from "discord.js";

type ExeFunction = (int: CommandInteraction) => Promise<void>;

class SlashCommand {
  public name: string;
  public description: string;
  public options?: ApplicationCommandOptionData[];
  public exe: ExeFunction;
  public defer?: boolean;

  public constructor(props: SlashCommand) {
    this.name = props.name;
    this.description = props.description;

    if (props.options) this.options = props.options;
    this.defer = props.defer ?? false;

    this.exe = props.exe;
  }
}

export { SlashCommand };
