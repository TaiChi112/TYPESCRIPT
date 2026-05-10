import pino from 'pino';

export const logger = pino({
	name: 'uaps',
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	transport: process.env.NODE_ENV === 'production' ? undefined : {
		target: 'pino-pretty',
		options: { colorize: true }, // ทำให้มีสีสันสวยงามอ่านง่ายบน Terminal
	},
});