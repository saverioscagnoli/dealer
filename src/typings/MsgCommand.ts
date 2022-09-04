import { Message } from "discord.js";
import { DealerClient } from "./Client";
import { Schema } from "./Schema";

interface MsgCommandExeFunctionOptions {
  msg: Message;
  args: string[];
  client: DealerClient;
  authorID: string;
  username: string;
  pl: Schema;
}

type MsgCommandExeFunction = (opt: MsgCommandExeFunctionOptions) => any;

interface MsgCommand {
  name: string;
  description: string;
  aliases?: string[];
  cd?: number;
  exe: MsgCommandExeFunction;
}

export { MsgCommand };
