import { validationResult } from "express-validator";
import asyncHandler from "../middlewares/asyncHandler.js";
import userModel from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import { uploadAvatarService } from "../services/userService.js";

const signup = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array().map((err) => err.msg);
    throw error;
  }
  const { email, name, password } = req.body;
  const userExists = await userModel.findOne({ email });
  if (userExists) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  let hashedPassword;
  hashedPassword = await bcrypt.hash(password, 12);
  const user = await userModel.create({
    name: name,
    email: email,
    password: hashedPassword,
  });
  if (user) {
    generateToken(res, user);
    res.status(201).json({
      message: "User created",
      userId: user._id,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array().map((err) => err.msg);
    throw error;
  }
  const { email, password } = req.body;
  let decrypted;
  const user = await userModel.findOne({ email });
  if (!user) {
    const error = new Error("user not found.");
    error.statusCode = 401;
    throw error;
  }
  decrypted = await bcrypt.compare(password, user.password);
  if (user && decrypted) {
   const token = await generateToken(res, user);
    
    // let token;
    // token = req.cookies.jwt;
    res.status(200).json({ token: token, userId: user._id.toString() });
  } else {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
});

const getProfile = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const user = await userModel.findById(userId._id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 400;
    throw error;
  } else {
    res
      .status(200)
      .json({ message: "Profile fetched successfully", data: {
        email: user.email,
        name: user.name,
        joined: user.createdAt,
        documents: user.documents,
        avatar: user.avatar || null,
        bio: user.bio || null,
        socials: {
          facebook: user.socialMediaLinks.facebook || null ,
          twitter: user.socialMediaLinks.twitter || null,
          instagram: user.socialMediaLinks.instagram ||  null,
        }
      }
     });
  }
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array().map((err) => err.msg);
    throw error;
  }
  const{ name, bio, facebook, instagram, twitter } = req.body

  const file = req.file;

  const userId = req.userId;
  
  const user = await userModel.findById(userId._id.toString());
  let imageUrl 
  if (file) {
    imageUrl = await uploadAvatarService(file);
  }
  if (user) {
    
    user.name = name || user.name
    // user.email = email || user.email
    user.socialMediaLinks.facebook = facebook || user.socialMediaLinks.facebook
    user.socialMediaLinks.instagram = instagram || user.socialMediaLinks.instagram
    user.socialMediaLinks.twitter = twitter || user.socialMediaLinks.twitter
    user.avatar = imageUrl || user.avatar

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } else {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  
});

export { 
  signup, 
  login, 
  getProfile, 
  updateProfile 
};
