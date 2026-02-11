import express from "express";
import cors from "cors"
import dataRoutes from "./routes/dataRoutes.js"

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/data", dataRoutes);

export default app;
