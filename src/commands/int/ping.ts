import { IntCommand } from "../../typings";

const Ping: IntCommand = {
  name: "ping",
  description: "Pong!",
  exe: async ({ int, client }) => {
    await int.reply(`**Pong!** The latency is **\`${client.ws.ping}\`** ms.`);
  },
};

export { Ping };
