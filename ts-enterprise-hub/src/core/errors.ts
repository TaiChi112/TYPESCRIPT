export class AppError extends Error {
	readonly statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = new.target.name;
		this.statusCode = statusCode;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string, statusCode = 404) {
		super(message, statusCode);
	}
}

export class DatabaseError extends AppError {
	constructor(message: string, statusCode = 500) {
		super(message, statusCode);
	}
}