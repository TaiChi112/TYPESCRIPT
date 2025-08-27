import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

function main() {
    app.get('/', (req: Request, res: Response) => {
        res.json({
            message: 'Hello, World!',
            timestamp: new Date().toISOString()
        });
    });

    try {
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
main();