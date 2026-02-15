import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import app from "./src/app.js";
import cors from "cors";

dotenv.config({
  path: ".env",
});


app.use(cors({
  origin: "https://one-geo-assignment.onrender.com/",
  credentials: true
}));

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server started at port ${PORT}!`);
});
