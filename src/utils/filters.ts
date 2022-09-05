import {
  ButtonInteraction,
  CollectorFilter,
  CommandInteraction,
  Message,
  MessageComponentInteraction,
} from "discord.js";
import { sqlite } from "./sqlite";

export const filters = {
  coinflip(
    ids: string[],
    authorID: string
  ): CollectorFilter<[ButtonInteraction<"cached">]> {
    return (btnInt): boolean => {
      if (!ids.includes(btnInt.customId)) return false;
      return btnInt.user.id === authorID;
    };
  },
  horseRace(
    ids: string[],
    n: number,
    joined: string[],
    sID: string,
    authorID: string
  ): CollectorFilter<[ButtonInteraction<"cached">]> {
    return async (btnInt): Promise<boolean> => {
      if (!ids.includes(btnInt.customId)) return false;
      if (btnInt.customId !== sID) {
        if (joined.includes(btnInt.user.id)) {
          await btnInt.reply({
            content: "You have already joined the race!",
            ephemeral: true,
          });
          return false;
        }
        let valid = await sqlite.bet(btnInt.user.id, n, btnInt);
        if (!valid) return false;

        joined.push(btnInt.user.id);
        return true;
      } else {
        return btnInt.user.id === authorID;
      }
    };
  },
};
