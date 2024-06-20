import mongoose from "mongoose";
import { Event } from "~/core/event";

export default new Event("ready", async client => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setActivity({ name: "Gambling" });

  if (!process.env.MONGO_URI) {
    console.error("No MongoDB URI provided.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  if (mongoose.connection.readyState === 1) {
    console.log("Connected to the database.");
  }
});
