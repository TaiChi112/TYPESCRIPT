import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 8080;

const data: { [key: string]: any } = {
    name: 'John Doe',
    age: 30,
    occupation: 'Software Developer'
};
app.get('/', (req, res) => {
    res.json(data);
    console.log('Data sent:', data);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});