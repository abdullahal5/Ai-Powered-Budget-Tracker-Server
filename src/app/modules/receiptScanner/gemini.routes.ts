import { UserRole } from "@prisma/client";
import express from "express";
import { auth } from "../../middlewares";
import { GeminiController } from "./gemini.controller";
import multer, { StorageEngine } from "multer";

const router = express.Router();

const storage: StorageEngine = multer.memoryStorage();

export const upload = multer({ storage });

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  upload.single("file"),
  GeminiController.geminiFileScanner
);

export const geminiRoute = router;
