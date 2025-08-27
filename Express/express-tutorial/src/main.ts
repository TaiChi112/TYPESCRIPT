import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";

const app = express();
app.use(bodyParser.json());

// PostgreSQL database configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cos3103",
  password: "postgres",
  port: 5432,
});

// Register endpoint with PostgreSQL
app.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Insecure: Store password in plain text (do not use in production)
    const result = await pool.query(
      "INSERT INTO userss (username, password) VALUES ($1, $2)",
      [username, password],
    );
    res.json({ message: "Registration successful" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login endpoint with PostgreSQL
app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM userss WHERE username = $1 AND password = $2",
      [username, password],
    );

    if (result.rows.length > 0) {
      res.json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Error authenticating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
