import express from "express";
import { body, check } from "express-validator";
import { makeAComment } from "../controllers/commentsController.js";

import authProtect from "../middlewares/authProtect.js";
const router = express.Router();

router.post(
  "/comment/:documentId",
  body("comment").notEmpty().withMessage("Comment is required"),
  authProtect,
  makeAComment
);

export default router;
