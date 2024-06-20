declare namespace NodeJS {
  export interface ProcessEnv {
    /* The Bot token */
    TOKEN: string;

    /* Bot ID, from the Discord developer portal */
    CLIENT_ID: string;

    /* The ID of the server where the commands should be loaded */
    GUILD_ID: string;

    /* The MongoDB URI, to connect to the database */
    MONGO_URI: string;
  }
}
