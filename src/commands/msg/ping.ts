import { MsgCommand } from "../../typings";

const Ping: MsgCommand = {
  name: "ping",
  description: "Pong!",
  exe: async ({ msg, client }) => {
    await msg.reply(`**Pong!** The latency is **\`${client.ws.ping}\`** ms.`);
    return;
  },
};

export { Ping };
