import { EmbedBuilder, EmbedData } from "discord.js";
import { Dealer } from "../structs";
import { DatabaseModel } from "../types";
import { EMBED_COLOR } from "./consts";

export abstract class Utils {
  public static embed(props: EmbedData) {
    return new EmbedBuilder({ ...props, color: EMBED_COLOR });
  }

  public static async readDb(id: string) {
    let data: DatabaseModel = await Dealer.profData.get(id);
    if (!data) {
      data = { chips: 1e4, wins: 0, losses: 0 };
      await Dealer.profData.set(id, data);
    }
    return data;
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
