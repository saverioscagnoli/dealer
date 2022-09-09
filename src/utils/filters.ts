import { ButtonInteraction, CollectorFilter } from "discord.js";
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
  join(
    jID: string,
    sID: string,
    n: number,
    joined: string[]
  ): CollectorFilter<[ButtonInteraction<"cached">]> {
    return async (btnInt): Promise<boolean> => {
      if (jID !== btnInt.customId && sID !== btnInt.customId) return false;
      if (btnInt.customId !== sID) {
        if (joined.includes(btnInt.user.id)) {
          await btnInt.reply({
            content: "**You already joined the table!**",
            ephemeral: true,
          });
          return false;
        }
        let valid = await sqlite.bet(btnInt.user.id, n, btnInt);
        if (!valid) return false;
        joined.push(btnInt.user.id);
        return true;
      } else {
        if (btnInt.user.id !== joined[0]) {
          await btnInt.reply({
            content: "**Only the author of this command can start the match!**",
            ephemeral: true,
          });
          return false;
        } else return true;
      }
    };
  },
  blackjack(
    ids: string[],
    joined: string[],
    joinedCopy: string[]
  ): CollectorFilter<[ButtonInteraction<"cached">]> {
    return async (btnInt): Promise<boolean> => {
      if (!ids.includes(btnInt.customId)) return false;
      if (!joinedCopy.includes(btnInt.user.id)) {
        await btnInt.reply({
          content: "**You did't join this table!**",
          ephemeral: true,
        });
        return false;
      }
      if (btnInt.user.id !== joined[0]) {
        await btnInt.reply({
          content: "**It's not your turn!**",
          ephemeral: true,
        });
        return false;
      }
      return true;
    };
  },
  roulette(
    ids: string[],
    joined: string[],
    uBets: any,
    readys: string[]
  ): CollectorFilter<[ButtonInteraction<"cached">]> {
    return async (btnInt): Promise<boolean> => {
      if (!ids.includes(btnInt.customId)) return false;
      if (!joined.includes(btnInt.user.id)) {
        await btnInt.reply({
          content: "**You did't join this table!**",
          ephemeral: true,
        });
        return false;
      }
      if (
        btnInt.customId.startsWith("ready") &&
        readys.includes(btnInt.user.id)
      ) {
        await btnInt.reply({
          content: "**You already pressed ready!**",
          ephemeral: true,
        });
        return false;
      }
      if (
        uBets[btnInt.user.id].bets.length === 0 &&
        btnInt.customId.startsWith("ready")
      ) {
        await btnInt.reply({
          content: "**Place at least 1 bet before pressing Ready!**",
          ephemeral: true,
        });
        return false;
      }
      if (uBets[btnInt.user.id].bets.includes(btnInt.component.label)) {
        await btnInt.reply({
          content: `**You already placed a bet on \`${btnInt.component.label}\`!**`,
          ephemeral: true,
        });
        return false;
      }
      return true;
    };
  },
};
