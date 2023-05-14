import { Utils } from "../utils";
import { Card } from "./Card";

export class BlackjackPlayer {
  public hand: Card[];
  public id: string;
  public bust: boolean;
  public score: number;

  constructor(id: string) {
    this.hand = [];
    this.id = id;
    this.bust = false;
  }

  public draw(deck: Card[]) {
    let card = Utils.pick(deck);
    let i = deck.findIndex(c => c === card);
    deck.splice(i, 1);
    this.hand.push(card);
    if (!deck.length) deck.push(...Utils.blackjackDeck());
  }

  public sum() {
    let s = this.hand.map(c => c.numericValue).reduce((a, b) => a + b);
    this.score = s;
    this.bust = s > 21;
    return s;
  }

  public checkWin(dScore: number) {
    if (this.bust) return false;
    if (dScore > 21) return true;
    return this.score > dScore;
  }
}
