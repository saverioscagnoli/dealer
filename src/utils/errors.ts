function handleErrors() {
  process.on("unhandledRejection", async (err) => {
    console.error("Unhandled Promise Rejection:\n", err);
  });
  process.on("uncaughtException", async (err) => {
    console.error("Uncaught Promise Exception:\n", err);
  });
  process.on("uncaughtExceptionMonitor", async (err) => {
    console.error("Uncaught Promise Exception (Monitor):\n", err);
  });
}

export { handleErrors };
