import { IntentsBitField } from "discord.js";
import { Dealer } from "./structs";
import "dotenv/config";

const { Guilds, GuildMessages } = IntentsBitField.Flags;

const client = new Dealer({ intents: [Guilds, GuildMessages] });
