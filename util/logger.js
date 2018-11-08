'use strict';
const { createLogger, format, transports } = require('winston');
const { combine, colorize, timestamp, printf } = format;
const day = require('dayjs');
const packageJson = require('../package.json');

const myFormat = printf(info => {
  return `${day(info.timestamp).format('YYYY-MM-DD HH:mm:ss:SSS')} [${packageJson.name}] ${info.level}: [${process.pid}] ${info.message}`;
});

module.exports = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(colorize(), timestamp(), myFormat),
  transports: [ new transports.Console() ],
});
