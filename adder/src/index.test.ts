import { add } from "./index";

describe("add", () => {
  it("2 + 2 = 4", () => {
    expect(add(2, 2)).toStrictEqual(4);
  });
});
