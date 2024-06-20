import { Event } from "~/core/event";

export default new Event("ready", client => {
  console.log(`Logged in as ${client.user.tag}`);
  
  client.user.setActivity({ name: "Gambling" });
});
