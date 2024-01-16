import { validationResult } from "express-validator";

import userModel from "../models/userModel.js";
import documentModel from "../models/documentModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import commentModel from "../models/commentModel.js";

const makeAComment = asyncHandler(async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array().map((err) => err.msg);
    throw error;
  }
    const comment = req.body.comment;
    const documentId = req.params.documentId
    const userId = req.userId;
    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 422;
      throw error;
    }
    if (!userId) {
      const error = new Error("UnAuthenticated");
      error.statusCode = 403;
      throw error;
    }
    const document = await documentModel.findById(documentId)
    if (!document) {
      const error = new Error("Could not find document");
      error.statusCode = 400;
      throw error;
    }
    const commentCreated = await commentModel.create({
      comment: comment,
      creator: userId
    })
    document.comments.push(commentCreated)
    document.save()
    res.status(201).json({
      message: "Comment created successfully",
      post: commentCreated,

    });
})

export {
  makeAComment
}