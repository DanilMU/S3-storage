import { createLogger, format, transports } from "winston";

const { combine, colorize, timestamp, printf } = format

const customFormat = format(info => {
    info.level = info.level.toUpperCase();
    info.pid = process.pid;

    return info;
})

const prettyPrint = printf(({ pid, level, message, timestamp, label }) => {
    return `${timestamp}     \x1b[32m${level}\x1b[32m \x1b[33m[${label}]\x1b[0m
    \x1b[32m${message}\x1b[0m`
})

const logger = createLogger({
    level: 'debug',
    format: combine(
        customFormat(),
        timestamp(),
        timestamp({
            format: 'MM/DD/YYYY HH:mm:ss'
        }),
        prettyPrint
    ),
    transports: [new transports.Console()],
    exitOnError: false,
})

export { logger as Logger } 