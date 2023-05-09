import {
  CommandInteraction,
  GuildMember,
  CommandInteractionOptionResolver,
  ChatInputApplicationCommandData
} from "discord.js";
import { Dealer } from "../structs";

export interface Interaction extends CommandInteraction {
  member: GuildMember;
}

export interface ExeOptions {
  client: Dealer;
  int: Interaction;
  args: CommandInteractionOptionResolver;
}

export type SlashCommandT = {
  cd?: number;
  exe: (opts: ExeOptions) => void;
} & ChatInputApplicationCommandData;
