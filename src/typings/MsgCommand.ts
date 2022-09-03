import { Message } from "discord.js";
import { DealerClient } from "./Client";

interface MsgCommandExeFunctionOptions {
  msg: Message;
  args: string[];
  client: DealerClient;
  userID: string;
  username: string;
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
