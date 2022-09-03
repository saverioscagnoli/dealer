import { Event } from "../typings";

const Ready: Event<"ready"> = {
  name: "ready",
  exe: client => {
    console.log(`Logged as ${client.user.tag}`);
  },
};

export { Ready };
