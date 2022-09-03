import "dotenv/config";
import { DealerClient } from "./typings";

const client = new DealerClient();
client.build();

export { client };
