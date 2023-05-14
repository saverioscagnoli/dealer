import { User } from "discord.js";
import { Utils } from "../utils";
import { randomUUID } from "crypto";

export class Horse {
  public name: string;
  public ownerId: string;
  public progress: String[];
  public customId: string;

  constructor(name: string) {
    this.name = name;
    this.ownerId = null;
    this.progress = [this.getSprite()];
    this.customId = randomUUID();
  }

  private getSprite() {
    return Utils.pick(["🎠", "🏇", "🐎"]);
  }

  public setOwner(owner: User) {
    this.ownerId = owner.id;
  }
}
