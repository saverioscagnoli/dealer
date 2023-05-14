import { EmbedBuilder, EmbedData } from "discord.js";
import { Card, Dealer } from "../structs";
import { DatabaseModel } from "../types";
import { EMBED_COLOR } from "./consts";
import { randomInt } from "crypto";
import { Tables } from "../types";

export abstract class Utils {
  public static rng(min: number, max: number) {
    return randomInt(min, max + 1);
  }

  public static pick<T>(arr: T[]) {
    return arr[Utils.rng(0, arr.length - 1)];
  }

  public static shuffle<T>(arr: T[]) {
    let ci = arr.length;
    let rndi: number;
    while (ci != 0) {
      rndi = Math.floor(Math.random() * ci);
      ci--;
      [arr[ci], arr[rndi]] = [arr[rndi], arr[ci]];
    }
    return arr;
  }

  public static sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  public static embed(props: EmbedData) {
    return new EmbedBuilder({ ...props, color: EMBED_COLOR });
  }

  public static blackjackDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K"
    ];
    const numericValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
    let deck: Card[] = [];
    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < values.length; j++) {
        let card = new Card({
          suit: suits[i],
          value: values[j],
          numericValue: numericValues[j]
        });
        deck.push(card);
      }
    }
    return Utils.shuffle(deck);
  }

  public static async validateBet(bet: number, chips: number, id?: string) {
    if (bet < 1) return "You can't bet less than 1 chip.";
    if (bet > chips) return "You can't bet more chips than you have.";
    if (id) {
      await Utils.editChips(id, -bet);
    }
    return true;
  }

  public static validateBint(customIds: string[], customId: string) {
    return customIds.includes(customId);
  }

  public static async readDb(id: string) {
    let data: DatabaseModel = await Dealer.profData.get(id);
    if (!data) {
      data = { chips: 1e4, wins: 0, losses: 0 };
      await Dealer.profData.set(id, data);
    }
    return data;
  }

  public static async writeDb(id: string, data: DatabaseModel) {
    await Dealer.profData.set(id, data);
  }

  public static async editChips(id: string, n: number) {
    let data = await Utils.readDb(id);
    await Utils.writeDb(id, { ...data, chips: data.chips + n });
  }

  public static async editWins(id: string, n: number) {
    let data = await Utils.readDb(id);
    await Utils.writeDb(id, { ...data, wins: data.wins + n });
  }

  public static async editLosses(id: string, n: number) {
    let data = await Utils.readDb(id);
    await Utils.writeDb(id, { ...data, losses: data.losses + n });
  }

  public static async addTable(k: Tables): Promise<number> {
    let tables = await Dealer.tables.get(k);
    if (!tables) {
      await Dealer.tables.set(k, 1);
      return 1;
    } else {
      let t = tables + 1;
      await Dealer.tables.set(k, t);
      return t;
    }
  }

  public static async removeTable(k: Tables) {
    let t = await Dealer.tables.get(k);
    await Dealer.tables.set(k, t - 1);
  }
}
