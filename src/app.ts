import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import status from "http-status";
import router from "./app/routes";
import { globalErrorHandler } from "./app/middlewares";
import { registerClerkWebhook } from "./app/webhooks";
import { serve } from "inngest/express";
import { inngest, functions } from "./ingest";

const app: Application = express();
app.use(cors());
app.use(cookieParser());

// Register webhook
registerClerkWebhook(app);

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "GOOD BUDGET SERVER IS RUNNING",
  });
});

// routes
app.use("/api/v1", router);

// ingest
app.use("/api/inngest", serve({ client: inngest, functions }));

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(status.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
