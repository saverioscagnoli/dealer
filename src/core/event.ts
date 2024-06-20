import { type ClientEvents } from "discord.js";

type EventCallback<K extends keyof ClientEvents> = (
  ...args: ClientEvents[K]
) => void;

class Event<K extends keyof ClientEvents> {
  public name: string;
  public callback: EventCallback<K>;

  public constructor(name: K, callback: EventCallback<K>) {
    this.name = name;
    this.callback = callback;
  }
}

export { Event };
