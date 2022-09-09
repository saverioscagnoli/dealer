import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { DealerClient } from "./Client";
import { Schema } from "./Schema";

interface IntCommandExeFunctionOptions {
  int: CommandInteraction;
  args: CommandInteractionOptionResolver;
  client: DealerClient;
  authorID: string;
  username: string;
  pl: Schema;
}

type IntCommandExeFunction = (opt: IntCommandExeFunctionOptions) => any;

type IntCommand = {
  cd?: number;
  exe: IntCommandExeFunction;
} & ChatInputApplicationCommandData;

export { IntCommand };
