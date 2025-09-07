import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { prisma } from "../../../shared";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../../../config/config";

const genAi = new GoogleGenerativeAI(config.gemini_key.secret as string);

const getScannedTextFromGemini = async (
  file: Express.Multer.File,
  user: JwtPayload
) => {
  const findUser = await prisma.user.findUnique({
    where: { clerkUserId: user.sub },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const model = genAi.getGenerativeModel({ model: "gemini-1.5" });

  const base64String = file.buffer.toString("base64");

  const prompt = `
    Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense)
    
    Only respond with valid JSON in this exact format:
    {
      "amount": number,
      "date": "ISO date string",
      "description": "string",
      "merchantName": "string",
      "category": "string"
    }

    If it's not a receipt, return an empty object
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64String,
        mimeType: file.mimetype,
      },
    },
  ]);

  const res = result.response;
  const text = res.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  console.log(res, text);

  try {
    const data = JSON.parse(cleanedText);

    return {
      amount: parseFloat(data.amount),
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      merchantName: data.merchantName,
    };
  } catch (parseError) {
    console.error("Error parsing JSON response:", parseError);
    throw new Error("Invalid response format from Gemini");
  }
};

export const GeminiService = {
  getScannedTextFromGemini,
};
