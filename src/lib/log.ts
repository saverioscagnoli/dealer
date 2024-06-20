import { Console } from "console";
import { Transform } from "stream";

/**
 * Display data in a table format,
 * similar to console.table but without the index column
 *
 * @param input The data to be displayed in a table
 *
 * @example
 * table([{ name: "Alice", age: 25 }, { name: "Bob", age: 30 }]);
 *
 * ┌──────┬─────┐
 * │ name │ age │
 * ├──────┼─────┤
 * │ Alice│ 25  │
 * ├──────┼─────┤
 * │ Bob  │ 30  │
 * └──────┴─────┘
 */
function table(input: unknown[]) {
  let ts = new Transform({
    transform(chunk, _, cb) {
      cb(null, chunk);
    }
  });

  let logger = new Console({ stdout: ts });

  logger.table(input);

  let table = (ts.read() || "").toString();
  let result = [];

  for (let row of table.split(/[\r\n]+/)) {
    let r = row.replace(/[^┬]*┬/, "┌");
    r = r.replace(/^├─*┼/, "├");
    r = r.replace(/│[^│]*/, "");
    r = r.replace(/^└─*┴/, "└");
    r = r.replace(/'/g, " ");

    result.push(`${r}\n`);
  }

  result[result.length - 1] = result.at(-1).trim();
  console.log(result.join(""));
}

export { table };
