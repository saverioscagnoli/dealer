import {
  ButtonInteraction,
  CollectorFilter,
  CommandInteraction,
  Message,
  MessageComponentInteraction,
} from "discord.js";

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
};
