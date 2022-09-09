import {
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  CommandInteraction,
  EmbedBuilder,
  Message,
  User,
} from "discord.js";
import { DealerClient } from "../typings";
import { EmbedAssets } from "./enums";
import { math } from "./math";

interface Embed {
  title: string;
  desc?: string;
  thumb?: string;
  image?: string;
  color?: ColorResolvable;
  fields?: { name: string; value: string }[];
  author?: { name: string; iconURL?: string };
  footer?: { text: string; iconURL?: string };
}

interface Button {
  customID: string;
  label: string;
  style: ButtonStyle;
  disabled?: boolean;
}

interface Horse {
  name: string;
  id: string;
  owner: User;
  position: string[];
}

interface Card {
  value: number;
  card: string;
}

interface RouletteNumber {
  color: string;
  value: number;
}

const misc = {
  Embed(o: Embed): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(o.title)
      .setDescription(o.desc ?? null)
      .setThumbnail(o.thumb ?? null)
      .setImage(o.image ?? null)
      .setColor(o.color ?? EmbedAssets.Color)
      .setFields(o.fields ?? [])
      .setAuthor(o.author ?? null)
      .setFooter(o.footer ?? null);
  },
  Button(o: Button): ButtonBuilder {
    return new ButtonBuilder()
      .setCustomId(o.customID)
      .setLabel(o.label)
      .setStyle(o.style)
      .setDisabled(o.disabled ?? false);
  },
  displayHorses(horses: Horse[]) {
    return horses
      .map(
        ({ name, owner, position }) =>
          `**${name}** - ${owner ?? "Nobody"}
         ${position.join("")}
         ----------------------------------------------------------------------🏁`
      )
      .join("\n");
  },
  createDeck(): Card[] {
    let suits = ["♤", "♡", "♧", "♢"];
    let ranks = [
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
      "K",
    ];
    let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
    let deck: Card[] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 13; j++) {
        deck.push({ value: values[j], card: ranks[j] + suits[i] });
      }
    }
    return math.shuffle(deck);
  },
  draw(deck: Card[], hand: Card[]) {
    let p = math.pick(deck);
    //deck.splice(deck.indexOf(p, 1));
    hand.push(p);
    return p as Card;
  },
  displayHandsBJ(
    names: string[],
    pHands: any[][],
    dHand: Card[],
    index?: number,
    stood = false,
    dTurn = false
  ) {
    let fields: { name: string; value: string }[] = [];
    for (let i = 0; i < names.length; i++) {
      let sum = math.sum(pHands[i].map((c) => c.value));
      if (stood && i === index) {
        fields.push({
          name: `${names[i]}'s hand:`,
          value: `${pHands[i]
            .map((c) => c.card)
            .join(", ")} → **\`${sum}\` Stood!** `,
        });
      } else {
        fields.push({
          name: `${names[i]}'s hand:`,
          value: `${pHands[i].map((c) => c.card).join(", ")} → **\`${sum}\`** ${
            sum === 21 ? "**Blackjack!**" : sum > 21 ? "**Busted!**" : ""
          }`,
        });
      }
    }
    let dSum = math.sum(dHand.map((c) => c.value));
    fields.push({
      name: "Dealer's hand:",
      value: dTurn
        ? `${dHand.map((c) => c.card).join(", ")} → **\`${dSum}\`** ${
            dSum === 21 ? "**Blackjack!**" : dSum > 21 ? "**Busted!**" : ""
          }`
        : `${dHand[0].card}, ?`,
    });
    return fields;
  },
  rouletteWheel() {
    let roulette: RouletteNumber[] = [{ value: 0, color: "🟢" }];
    for (let i = 1; i <= 36; i++) {
      if (i <= 10 || (i > 18 && i <= 28))
        roulette.push(
          i % 2 == 0 ? { value: i, color: "⚫" } : { value: i, color: "🔴" }
        );
      else if (i <= 18 || (i > 28 && i <= 36))
        roulette.push(
          i % 2 == 0 ? { value: i, color: "🔴" } : { value: i, color: "⚫" }
        );
    }
    return roulette;
  },
  displayBetsRL(names: string[], joined: string[], uObj: any) {
    let fields: { name: string; value: string; inline?: boolean }[] = [];
    for (let i = 0; i < names.length; i++) {
      let bets = uObj[joined[i]].bets;
      fields.push({
        name: `${names[i]}'s bets:`,
        value: bets.length === 0 ? "None!" : `• ${bets.join("\n• ")}`,
        inline: true,
      });
    }
    return fields;
  },
  async checkForTables(
    id: string,
    client: DealerClient,
    table: string,
    req: Message | CommandInteraction
  ) {
    if (client.tables[table]?.includes(id)) {
      let str = `**You already requested a table for ${table}! Finish your previous match before starting another.**`;
      if (req instanceof CommandInteraction) {
        await req.reply({
          content: str,
          ephemeral: true,
        });
      } else {
        await req.reply(str);
      }
      return false;
    }
    return true;
  },
};

function sleep(sec: number) {
  return new Promise((res) => setTimeout(res, sec * 1000));
}
export { misc, sleep, Horse };
