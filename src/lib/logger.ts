import winston from "winston";

const isDev = process.env.NODE_ENV !== "production";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    isDev
      ? winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
      : winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        isDev
          ? winston.format.colorize({ all: true })
          : winston.format.uncolorize(),
        isDev ? winston.format.simple() : winston.format.json()
      ),
    }),
  ],
});

export default logger;
