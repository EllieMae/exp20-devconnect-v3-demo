exports.GetLogger = function (env) {
    const winston = require('winston');
    const colors = require('colors');
    const { combine, timestamp, printf } = winston.format;
    const logColors = {
        error: 'red', 
        warn: 'yellow', 
        info: 'white', 
        http: 'gray',
        verbose: 'gray', 
        debug: 'gray', 
        silly: 'gray'
    };

    const logFormat = printf(({ level, message, timestamp }) => {
        //return colors[logColors[level]](`${timestamp} ${level} - ${message}`);
        return colors[logColors[level]](message);
    });

    return winston.createLogger({
        level: env.logLevel || 'info',
        format: combine(
            timestamp(),
            logFormat,
        ),
        transports: [
            new winston.transports.Console()
        ]
    });
    
};