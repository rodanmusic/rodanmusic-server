var appRoot = require('app-root-path');
const winston = require('winston');

const options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 10,
        colorize: false,
    },
    console: {
	silent: true,
        level: 'info',
        handleExceptions: true,
        json: false,
        colorize: true,
    }
}

const logger = new winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ]
});

export default logger;
