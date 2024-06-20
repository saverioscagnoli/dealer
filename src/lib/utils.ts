import crypto from "crypto";

/**
 * Formats a string template literal into a code block.
 *
 * @example
 * code`Hello, World!` -> `Hello, World!`
 */
function code(strings: TemplateStringsArray, ...values: unknown[]) {
  let output = [];

  for (let i = 0; i < strings.length; i++) {
    let [str, val] = [strings[i], values[i]];

    output.push(str);

    if (i < values.length) {
      output.push(val);
    }
  }

  return `\`${output.join("")}\``;
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
function rng(min: number, max: number) {
  return crypto.randomInt(min, max + 1);
}

export { code, rng };
