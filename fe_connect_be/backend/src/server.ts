import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import mysql from "mysql2";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "TaiChi",
  database: "fe_cn_be",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const server = express();
const PORT = 4000;

server.use(cors()); // Enable CORS for all routes
server.use(express.json()); // Parse JSON bodies
server.get("/api/data", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.promise().query("select * from sometable");
    res.json({
      msg: "Data fetched from mysql!",
      items: rows,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
server.post("/api/form", async (req: Request, res: Response) => {
  try {
    const { name, description, price } = req.body;
    await pool
      .promise()
      .query(
        "insert into sometable (name, description, price) values (?, ?, ?)",
        [name, description, price],
      );
    res.json({ msg: "Data inserted into mysql!" });
  } catch (error) {
    console.error("Error inserting data: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
server.post("/api/some", (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    res.json({
      msg: "some data",
      name,
    });
    console.log("api/some run success");
  } catch (error) {
    console.error("Error inserting data: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
