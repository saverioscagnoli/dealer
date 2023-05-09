import { EmbedBuilder, EmbedData } from "discord.js";
import { Dealer } from "../structs";
import { DatabaseModel } from "../types";
import { EMBED_COLOR } from "./consts";
import { randomInt } from "crypto";

export abstract class Utils {
  public static rng(min: number, max: number) {
    return randomInt(min, max + 1);
  }

  public static sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  public static embed(props: EmbedData) {
    return new EmbedBuilder({ ...props, color: EMBED_COLOR });
  }

  public static validateBet(bet: number, chips: number) {
    if (bet < 1) return "You can't bet less than 1 chip.";
    if (bet > chips) return "You can't bet more chips than you have.";
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

  public static async editDbValue(
    id: string,
    key: keyof DatabaseModel,
    value: any
  ) {
    let data: DatabaseModel = await Utils.readDb(id);
    data[key] = value;
    Dealer.profData.set(id, data);
  }
}
