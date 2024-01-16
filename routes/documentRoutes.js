import express from "express";
import { body, check } from "express-validator";
import {
  createDocument,
  deleteDocument,
  editDocument,
  getDocuments,
  getSingleDocument,
  getUserDocuments,
  searchDocuments,
} from "../controllers/documentsController.js";
import authProtect from "../middlewares/authProtect.js";
const router = express.Router();

router.get("/", getDocuments);
router.get("/user-documents", authProtect , getUserDocuments)
router.post(
  "/",
  authProtect,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters long"),

    body("description")
      .notEmpty()
      .withMessage("Description is required")
      .isString()
      .withMessage("Description must be a string")
      .isLength({ min: 10 })
      .withMessage("Description must not exceed 10 characters"),

      body("category")
      .notEmpty()
      .withMessage("Category is required")
      .isString()
      .withMessage("Category must be a string"),
  ],
  createDocument
);
router.get("/:documentId", getSingleDocument);
router.put(
  "/:documentId",
  authProtect,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters long"),

    
    body("description")
      .notEmpty()
      .withMessage("Description is required")
      .isString()
      .withMessage("Description must be a string")
      .isLength({ min: 10 })
      .withMessage("Description must not exceed 10 characters"),

      body("category")
      .notEmpty()
      .withMessage("Description is required")
      .isString()
      .withMessage("Description must be a string")
  ],
  editDocument
);

router.delete("/:documentId", authProtect, deleteDocument);
router.get("/search", searchDocuments)
export default router;
