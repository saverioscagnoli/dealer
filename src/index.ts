import "dotenv/config";
import { DealerClient } from "./typings";
import { handleErrors } from "./utils/errors";

const client = new DealerClient();
client.build();
handleErrors();

export { client };
