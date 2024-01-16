import express from "express";
import { body, check } from "express-validator";
const router = express.Router();
import {
  getProfile,
  login,
  signup,
  updateProfile,
} from "../controllers/users.js";
import authProtect from "../middlewares/authProtect.js";
import userModel from "../models/userModel.js";

router.put(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (value, { req }) => {
        const userDoc = await userModel.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("Email exists already");
        }
      })
      .normalizeEmail(),
    body("password")
      .isLength({ min: 5, max: 10 })
      .isAlphanumeric()
      .withMessage(
        "Please enter a password with alphanumeric and atleast 5 characters"
      )
      .trim(),
    body("name").isLength({ min: 3 }).withMessage("Please enter a valid name"),
  ],
  signup
);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 5, max: 10 })
      .isAlphanumeric()
      .withMessage(
        "Please enter a password with alphanumeric and atleast 5 characters"
      )
      .trim(),
  ],
  login
);

router.get("/profile", authProtect, getProfile);

router.put(
  "/profile",
  authProtect,
  [
    body("name").isLength({ min: 3 }).withMessage("Please enter a valid name"),
  ],
  updateProfile
);

export default router;
