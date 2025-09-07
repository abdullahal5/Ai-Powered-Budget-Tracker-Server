import { UserRole } from "@prisma/client";
import express from "express";
import { auth } from "../../middlewares";
import { GeminiController } from "./gemini.controller";
import { upload } from "../../../utils/multer";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  upload.single("file"),
  GeminiController.geminiFileScanner
);

export const geminiRoute = router;
