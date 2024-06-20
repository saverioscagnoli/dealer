import { Schema, model } from "mongoose";
import { DATABASE_COLLECTION } from "~/lib/consts";

type UserSchema = {
  id: string;
  chips: number;
  wins: number;
  losses: number;
};

let userSchema = new Schema<UserSchema>(
  {
    id: String,
    chips: Number,
    wins: Number,
    losses: Number
  },
  { collection: DATABASE_COLLECTION }
);

export default model("userSchema", userSchema);
export type { UserSchema };
