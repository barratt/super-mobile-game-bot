import * as winston from "winston";
import moment from 'moment';

const { createLogger, format, transports } = winston
const { combine, timestamp, label, printf, colorize } = format

var tsFormat = () => (new Date()).toLocaleTimeString();

const myConsoleFormat = winston.format.printf(function (info) {
    return `[${moment().toISOString()}][${info.level}]: ${info.message}`;
});

let logger: winston.Logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new (winston.transports.Console)({
            // timestamp: tsFormat,
            format: combine(
                colorize(),
                myConsoleFormat
            ),
            level: 'info'
        }),
        new (winston.transports.File)({
            filename: `debug-${moment().format('YYYY-MM-DD')}.log`,
            level: 'debug',
            format: combine(
                myConsoleFormat
            ),
        })
    ],
});

export default logger;