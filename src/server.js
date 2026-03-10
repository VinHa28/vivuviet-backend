import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";

dotenv.config({
  path: `.env.${env}`,
});

import app from "./app.js";
import connectDB from "./config/db.js";
import { transporter } from "./config/emailConfig.js";

const PORT = process.env.PORT || 5000;

await connectDB();

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP READY");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env} mode`);
});
