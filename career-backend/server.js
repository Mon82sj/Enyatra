const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const parentRoutes = require("./routes/parentRoutes");
const interestsRoutes = require("./routes/interests");
const parentChildRoutes =require("./routes/parentChildRoutes");
const adminRoutes = require("./routes/adminRoutes");


const path = require("path");
const multer = require("multer");

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Set COEP headers globally (optional but safe for all)
app.use("/uploads", (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  }, express.static(path.join(__dirname, "uploads")));
  
// Serve static files for thumbnails and attachments
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Your API routes go below here...

require("dotenv").config();



app.use("/api", authRoutes);
app.use("/api", parentRoutes);
app.use("/api", interestsRoutes);
app.use("/api",parentChildRoutes);
app.use("/api/admin", adminRoutes);

  
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
