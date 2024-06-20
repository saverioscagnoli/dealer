import { Client } from "~/core/client";

const client = Client.build({ intents: ["Guilds"] });

await client.init();

client.login(process.env.TOKEN);

process.on("unhandledRejection", err => {
  console.error(err);
});

process.on("uncaughtException", err => {
  console.error(err);
});

export { client };
