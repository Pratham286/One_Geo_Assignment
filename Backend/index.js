import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import app from "./src/app.js";

dotenv.config({
  path: ".env",
});

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server started at port ${PORT}!`);
});
