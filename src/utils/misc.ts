import {
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  User,
} from "discord.js";
import { EmbedAssets } from "./enums";

interface Embed {
  title: string;
  desc?: string;
  thumb?: string;
  image?: string;
  color?: ColorResolvable;
  fields?: { name: string; value: string }[];
  footer?: { text: string; iconURL: string };
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

const misc = {
  Embed(o: Embed): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(o.title)
      .setDescription(o.desc ?? null)
      .setThumbnail(o.thumb ?? null)
      .setImage(o.image ?? null)
      .setColor(o.color ?? EmbedAssets.Color)
      .setFields(o.fields ?? [])
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
};

function sleep(sec: number) {
  return new Promise(res => setTimeout(res, sec * 1000));
}
export { misc, sleep, Horse };
