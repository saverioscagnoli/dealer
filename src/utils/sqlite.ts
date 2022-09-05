import {
  ButtonInteraction,
  CommandInteraction,
  Emoji,
  Message,
} from "discord.js";
import { client } from "..";
import { Schema } from "../typings";
import { Emojis } from "./enums";

const sqlite = {
  async checkDB(
    id: string,
    username?: string,
    create?: boolean
  ): Promise<Schema> {
    let pl = await client.db.get(id);
    if (!pl && create) {
      pl = await client.db.set(id, {
        name: username,
        chips: 10000,
        wins: 0,
        losses: 0,
      });
    }
    return pl as Schema;
  },
  async update(
    id: string,
    what: "name" | "chips" | "wins" | "losses",
    n: number | string
  ): Promise<void> {
    let pl = await sqlite.checkDB(id);
    if (what === "name") {
      await client.db.set(`${id}.${what}`, n);
    } else {
      await client.db.set(`${id}.${what}`, pl[what] + Number(n));
    }
  },
  async updWL(id: string, what: "wins" | "losses"): Promise<void> {
    await sqlite.update(id, what, 1);
  },
  async bet(
    id: string,
    n: number,
    req: Message | ButtonInteraction | CommandInteraction,
    shouldBet = true
  ): Promise<boolean> {
    if (!Number.isInteger(n) || n + n <= 0) {
      let str = `**Please enter a valid bet!**`;
      if (req instanceof Message) {
        await req.reply(str);
      } else {
        if (!req.replied) {
          await req.reply({
            content: str,
            ephemeral: true,
          });
        } else {
          await req.editReply({
            content: str,
          });
        }
      }
      return false;
    } else {
      let pl = await sqlite.checkDB(
        id,
        req instanceof Message ? req.author.username : req.user.username,
        true
      );
      if (n > pl.chips) {
        let str = `**You don't have enough chips! The max you can bet is \`${pl.chips.toLocaleString()}\` chips!** ${
          Emojis.Chips
        }`;
        if (req instanceof Message) {
          await req.reply(str);
        } else {
          if (!req.replied) {
            await req.reply({
              content: str,
              ephemeral: true,
            });
          } else {
            await req.editReply({
              content: str,
            });
          }
        }
        return false;
      }
      if (shouldBet) {
        await sqlite.update(id, "chips", -n);
      }
      return true;
    }
  },
};

export { sqlite };
