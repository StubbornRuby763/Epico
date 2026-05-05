import express from "express";
import bankRoutes from "./Routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Define global prefix
app.use("/api/v1", bankRoutes);

app.use(express.static("public"));

const PORT = process.env["PORT"] || 3000;
app.listen(PORT, () => {
  console.log(`Bank running in http://localhost:${PORT}/api/v1`);
});
