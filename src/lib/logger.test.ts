import logger from "../lib/logger";

describe("logger", () => {
  it("should be defined", () => {
    expect(logger).toBeDefined();
  });

  it("should have info level by default", () => {
    expect(logger.level).toBe("info");
  });

  it("should log messages without throwing", () => {
    expect(() => logger.info("Test message")).not.toThrow();
  });
});
