import { ActivityType } from "discord.js";
import { Event } from "../typings";

const Ready: Event<"ready"> = {
  name: "ready",
  exe: client => {
    console.log(`Logged as ${client.user.tag}`);
    client.user.setActivity({ name: "hentai", type: ActivityType.Watching });
  },
};

export { Ready };
