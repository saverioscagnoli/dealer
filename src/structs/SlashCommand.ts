import { ApplicationCommandOptionData } from "discord.js";
import { ExeOptions, SlashCommandT } from "../types";

export class SlashCommand implements SlashCommandT {
  public name: string;
  public description: string;
  public options?: ApplicationCommandOptionData[];
  cd?: number;
  public exe: (opts: ExeOptions) => void;

  constructor(props: SlashCommand) {
    for (let p in props) {
      this[p] = props[p];
    }
  }
}
