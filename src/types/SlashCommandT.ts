import {
  CommandInteraction,
  GuildMember,
  CommandInteractionOptionResolver,
  ChatInputApplicationCommandData
} from "discord.js";
import { Dealer } from "../structs";
import { DatabaseModel } from "./DatabaseModel";

export interface Interaction extends CommandInteraction {
  member: GuildMember;
}

export interface ExeOptions {
  client: Dealer;
  int: Interaction;
  args: CommandInteractionOptionResolver;
  data: DatabaseModel;
}

export type SlashCommandT = {
  cd?: number;
  exe: (opts: ExeOptions) => void;
} & ChatInputApplicationCommandData;
