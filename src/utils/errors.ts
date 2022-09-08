import { client } from "..";

function handleErrors() {
  process.on("unhandledRejection", async (err) => {
    console.error("Unhandled Promise Rejection:\n", err);
    clearTables();
  });
  process.on("uncaughtException", async (err) => {
    console.error("Uncaught Promise Exception:\n", err);
    clearTables();
  });
  process.on("uncaughtExceptionMonitor", async (err) => {
    console.error("Uncaught Promise Exception (Monitor):\n", err);
    clearTables();
  });
}

function clearTables() {
  for (let i in client.tables) {
    client.tables[i] = [];
  }
}

export { handleErrors };
