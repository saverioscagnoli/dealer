export class Card {
  public suit: string;
  public value: string;
  public numericValue: number;

  constructor(props: Card) {
    for (let p in props) {
      this[p] = props[p];
    }
  }
}
