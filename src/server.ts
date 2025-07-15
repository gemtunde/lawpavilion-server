import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDatabase from "./config/db";

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDatabase();
});
