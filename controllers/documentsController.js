import userModel from "../models/userModel.js";
import documentModel from "../models/documentModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  deleteFileService,
  uploadFileService,
} from "../services/documentService.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { formatBytes } from "../utils/formatBytes.js";

const getDocuments = asyncHandler(async (req, res, next) => {
  const { authors, category, tags, keyword } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const query = {};

  if (category) {
    query.category = new RegExp(category, "i");
  }

  if (keyword) {
    query.$or = [
      { title: new RegExp(keyword, "i") },
      { description: new RegExp(keyword, "i") },
      { category: new RegExp(keyword, "i") }
    ];
  }

  const documents = await documentModel.find(query).skip(skip).limit(limit);
  const totalCount = await documentModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    message: "Document fetched",
    documents: documents,
    meta: {
      page,
      limit,
      totalPages,
      totalCount,
    },
  });
});

const createDocument = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array().map((err) => err.msg);
    throw error;
  }
  const { title, description, category, author,  } = req.body;
  const userId = req.userId;
  const file = req.file;
  let creator;
  if (!file) {
    const error = new Error("No file provided");
    error.statusCode = 422;
    throw error;
  }
  
  const fileSize = formatBytes(file?.size)
  const imageUrl = await uploadFileService(file);
  const document = await documentModel.create({
    title: title,
    description: description,
    category: category,
    creator: userId,
    documentUrl: imageUrl,
    author: author,
    fileSize: fileSize
  });

  if (document) {
    const user = await userModel.findById(userId._id);
    if (user) {
      creator = user;
      res.status(201).json({
        message: "Document created successfully",
        document: document,
        // creator: { _id: creator._id, name: creator.name },
      });
    } else {
      const error = new Error("User not found");
      error.statusCode = 422;
      throw error;
    }
  } else {
    const error = new Error("Error creating document");
    error.statusCode = 500;
    throw error;
  }
});

const getSingleDocument = asyncHandler(async (req, res, next) => {
  const documentId = req.params.documentId;
  const document = await documentModel.findById(documentId);
  if (!document) {
    const error = new Error("Could not find document");
    error.statusCode = 400;
    throw error;
  } else {
    res.status(200).json({
      message: "Document fetched",
      document: document,
    });
  }
});

const editDocument = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array().map((err) => err.msg);
    throw error;
  }
  const documentId = req.params.documentId;
  const { title, description, category, author } = req.body;
  const document = await documentModel.findById(documentId);
  if (!document) {
    const error = new Error("Could not find document");
    error.statusCode = 400;
    throw error;
  }
  // console.log('first', document.creator._id.toString(), req.userId._id )
  if (document.creator._id.toString() !== req.userId._id) {
    const error = new Error("Not authorized");
    error.statusCode = 403;
    throw error;
  }
  document.title = title || document.title;
  document.description = description || document.description;
  document.category = category || document.category;
  document.documentUrl = document.documentUrl;
  document.author = author || document.author
  
  const updatedDocument = await document.save();

  if (updatedDocument) {
    res.status(201).json({
      message: "Document updated successfully",
      document: updatedDocument,
    });
  } else {
    const error = new Error("Error updating document");
    error.statusCode = 500;
    throw error;
  }
});

const deleteDocument = asyncHandler(async (req, res, next) => {
  const documentId = req.params.documentId;

  const document = await documentModel.findById(documentId);
  if (!document) {
    const error = new Error("Could not find document");
    error.statusCode = 400;
    throw error;
  }

  if (document.creator._id.toString() !== req.userId._id) {
    const error = new Error("Not authorized");
    error.statusCode = 403;
    throw error;
  }
  const deleted = await deleteFileService(document.documentUrl);
  const removeDocument = await documentModel.findByIdAndRemove(documentId);
  if (deleted && removeDocument) {
    res.status(200).json({ message: "document deleted" });
  }
});

const getUserDocuments = asyncHandler(async (req, res, next) => {
  if (!req.userId._id) {
    const error = new Error("Not authorized");
    error.statusCode = 403;
    throw error;
  }
  const userId = req.userId;
  const { title, description, category } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const query = {};

  let totalItems;
  if (title) {
    query.title = new RegExp(title, "i");
  }
  if (description) {
    query.description = new RegExp(description, "i");
  }
  if (category) {
    query.category = new RegExp(category, "i");
  }

  const user = await userModel.findById(userId._id);
  if (!user) {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }
  query["creator._id"] = user._id.toString();
  const documents = await documentModel.find(query).skip(skip).limit(limit);
  totalItems = await documentModel.find(query);
  const totalCount = await documentModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    message: "Document fetched",
    documents: documents,
    meta: {
      page,
      limit,
      totalPages,
      totalCount,
    },
  });
});

const searchDocuments = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  const skip = (page - 1) * limit;

  const searchOptions = [
    { title: { $regex: query, $options: "i" } }, // Case-insensitive title search
    { description: { $regex: query, $options: "i" } }, // Case-insensitive description search
    { category: { $regex: query, $options: "i" } }, // Case-insensitive category search
  ];
  
  const documents = await documentModel
    .find({
      $or: searchOptions,
    })
    .skip(skip)
    .limit(limit);
 
  const totalCount = await documentModel.countDocuments({
    $or: searchOptions,
  });
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    message: "fetched successfully",
    documents: documents,
    meta: {
      page,
      limit,
      totalPages,
      totalCount,
    },
  });
});

export {
  getDocuments,
  createDocument,
  getSingleDocument,
  editDocument,
  deleteDocument,
  getUserDocuments,
  searchDocuments,
};
