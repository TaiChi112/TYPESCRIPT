import "dotenv/config";
import { RPCHandler } from "@orpc/server/node";
import { appRouter } from "./routers";
import { createContext } from "./lib/context";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.all("/api/auth{/*path}", toNodeHandler(auth));


const handler = new RPCHandler(appRouter);
app.use('/rpc{*path}', async (req, res, next) => {
  const { matched } = await handler.handle(req, res, {
    prefix: '/rpc',
    context: await createContext({ req }),
  });
  if (matched) return;
  next();
});

app.use(express.json())


app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
