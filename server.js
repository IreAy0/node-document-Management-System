import path from "path";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
dotenv.config();
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import commentRoutes from "./routes/commentRoutes.js"
import { errorHandler } from "./middlewares/errors.js";
import multer from "multer";
import cors from "cors"

const port =  4000;

connectDB();

const app = express();

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
    req.res.status(422).json({ message: "Please upload a pdf file" });
  }
};

const avatarFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" ) {
    cb(null, true);
  } else {
    cb(null, false);
    req.res.status(422).json({ message: "Please upload an image file" });
  }
};

app.use(bodyParser.json());

// app.use();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(cors())

app.use("/api/v1/user", multer({ storage: storage, fileFilter: avatarFilter }).single("file"),  userRoutes);

app.use("/api/v1/documents", multer({ storage: storage, fileFilter: fileFilter }).single("file") , documentRoutes);

app.use("/api/v1", commentRoutes)

app.get("/", (req, res) => res.send("Hello World!"));

app.use(errorHandler);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
