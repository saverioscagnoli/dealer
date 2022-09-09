import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { DealerClient } from "./Client";

interface IntCommandExeFunctionOptions {
  int: CommandInteraction;
  args: CommandInteractionOptionResolver;
  client: DealerClient;
}

type IntCommandExeFunction = (opt: IntCommandExeFunctionOptions) => any;

type IntCommand = {
  cd?: number;
  exe: IntCommandExeFunction;
} & ChatInputApplicationCommandData;

export { IntCommand };
