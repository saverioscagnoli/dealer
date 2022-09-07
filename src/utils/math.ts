const math = {
  rng(min: number, max: number, float = false): number {
    if (float) {
      return Math.random() * (max - min + 1) + min;
    } else {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  },
  flip(): boolean {
    return math.rng(0, 100) > 50;
  },
  pick(arr: any[]): any {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  shuffle(arr: any[]) {
    let cIndex = arr.length,
      rndIndex: number;
    while (cIndex != 0) {
      rndIndex = Math.floor(Math.random() * cIndex);
      cIndex--;
      [arr[cIndex], arr[rndIndex]] = [arr[rndIndex], arr[cIndex]];
    }
    return arr;
  },
  sum(arr: number[]) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  },
  randomID(): string {
    let pool =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_";
    let str = "";
    let spl = pool.split("");
    for (let i = 0; i < 21; i++) {
      str += math.pick(spl);
    }
    return str;
  },
  buttonID(name: string): string {
    return `${name}-${math.randomID()}`;
  },
};

export { math };
