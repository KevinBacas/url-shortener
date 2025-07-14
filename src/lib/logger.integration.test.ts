import logger from "../lib/logger";

describe("logger integration", () => {
  it("should log info messages without throwing and return logger", () => {
    expect(() => logger.info("Integration test message")).not.toThrow();
    expect(logger.info("Integration test message")).toBe(logger);
  });
});
