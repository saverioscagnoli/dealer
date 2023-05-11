import { Utils } from "../utils";
import { Card } from "./Card";

export class Player {
  public hand: Card[];
  public id: string;

  constructor(id: string) {
    this.hand = [];
    this.id = id;
  }

  public draw(deck: Card[]) {
    let card = Utils.pick(deck);
    let i = deck.findIndex(c => c === card);
    deck.splice(i, 1);
    this.hand.push(card);
  }
}
