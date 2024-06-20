import crypto from "crypto";

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

export { code, flip, rng };
