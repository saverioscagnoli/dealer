import { ClientEvents } from "discord.js";

interface Event<Key extends keyof ClientEvents> {
  name: Key;
  exe: (...args: ClientEvents[Key]) => any;
}

export { Event };
