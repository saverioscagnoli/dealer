import crypto from "crypto";
import type { CacheType, CommandInteraction } from "discord.js";

/**
 * Formats a string template literal into a code block.
 */
function code(value: unknown) {
  return `\`${value}\``;
}

/**
 * @param min The minimum value
 * @param max The maximum value
 * @returns A random integer between `min` and `max`
 *
 * @example
 * rng(1, 10) -> 5
 * rng(1, 10) -> 10
 * rng(1, 10) -> 1
 */
function rng(min: number, max: number): number {
  return crypto.randomInt(min, max + 1);
}

/**
 * Flips a coin with a certain chance of success.
 *
 * @param chance The chance of the flip being successful
 * @default 50
 * @returns A boolean value based on the chance
 */
function flip(chance: number = 50): boolean {
  return rng(1, 100) <= chance;
}

/**
 * Verifies if the user's bet is valid.
 * @param bet The amount of chips the user wants to bet
 * @param profileChips The amount of chips the user has
 * @param int The interaction object
 */
async function verifyBet(
  bet: number,
  profileChips: number,
  int: CommandInteraction<CacheType>
): Promise<boolean> {
  let replied = int.replied || int.deferred;

  if (bet < 1) {
    let msg = "You can't bet less than 1 chip!";

    if (replied) await int.editReply(msg);
    else await int.reply({ content: msg, ephemeral: true });

    return false;
  }

  if (bet > profileChips) {
    let msg = "You don't have enough chips to bet that much!";

    if (replied) await int.editReply(msg);
    else await int.reply({ content: msg, ephemeral: true });

    return false;
  }

  return true;
}

export { code, flip, rng, verifyBet };
