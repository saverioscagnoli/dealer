import type { UserSchema } from "~/schemas/user";
import userSchema from "~/schemas/user";

class Profile {
  private id: string;
  private chips: number;
  private wins: number;
  private losses: number;

  public constructor(data: UserSchema) {
    this.id = data.id;
    this.chips = data.chips;
    this.wins = data.wins;
    this.losses = data.losses;
  }

  public getID(): string {
    return this.id;
  }

  public getChips(): number {
    return this.chips;
  }

  public getWins(): number {
    return this.wins;
  }

  public getLosses(): number {
    return this.losses;
  }

  public getWinrate(): string {
    return this.getWins() === 0 && this.getLosses() === 0
      ? "0%"
      : `${((this.getWins() / (this.getWins() + this.getLosses())) * 100).toFixed(2)}%`;
  }

  public async addChips(amount: number): Promise<void> {
    await userSchema.updateOne(
      { id: this.getID() },
      { $inc: { chips: amount } }
    );
  }

  public async removeChips(amount: number): Promise<void> {
    await userSchema.updateOne(
      { id: this.getID() },
      { $inc: { chips: -amount } }
    );
  }
}

export { Profile };
