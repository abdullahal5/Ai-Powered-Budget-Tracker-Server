import { Application, Request, Response } from "express";
import { Webhook } from "svix";
import { raw } from "express";
import config from "../../config/config";
import { prisma } from "../../shared";

interface ClerkUserCreatedData {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string;
  last_name: string;
  image_url?: string;
}

interface ClerkUserCreatedEvent {
  type: "user.created";
  data: ClerkUserCreatedData;
}

export function registerClerkWebhook(app: Application) {
  app.post(
    "/clerk",
    raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      try {
        const payload = req.body.toString();
        const headers = req.headers as Record<string, string>;

        const wh = new Webhook(config.clerk_webhook.key || "");
        const evt = wh.verify(payload, headers) as ClerkUserCreatedEvent;

        console.log("Webhook event type:", evt.type);

        if (evt.type === "user.created") {
          const { id, email_addresses, first_name, last_name, image_url } =
            evt.data;

          // Validate required data
          if (!id) {
            console.error("Missing clerkUserId");
            return res.status(400).json({ error: "Missing user ID" });
          }

          if (!email_addresses || email_addresses.length === 0) {
            console.error("No email addresses provided");
            return res.status(400).json({ error: "No email provided" });
          }

          const email = email_addresses[0].email_address;
          const name =
            `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";

          console.log("Attempting to create user:", {
            clerkUserId: id,
            email,
            name,
          });

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { clerkUserId: id },
          });

          if (existingUser) {
            console.log("User already exists:", existingUser.id);
            return res.status(200).json({ message: "User already exists" });
          }

          // Create new user
          try {
            const newUser = await prisma.user.create({
              data: {
                clerkUserId: id,
                email: email,
                name: name,
                imageUrl: image_url || "",
              },
            });
            console.log("User created successfully:", newUser.id);

            // create default Account
            const defaultAccount = await prisma.account.create({
              data: {
                name: "Default Account",
                type: "SAVINGS",
                balance: 0,
                isDefault: true,
                userId: newUser.id,
              },
            });
            console.log("Default account created:", defaultAccount.id);
          } catch (createError: any) {
            console.error("Error creating user:", createError);
            // Check if it's a unique constraint violation
            if (createError.code === "P2002") {
              console.error("Unique constraint violation:", createError.meta);
            }
          }
        }

        res.status(200).json({ received: true });
      } catch (err) {
        console.error("Webhook error:", err);
        res.status(400).json({ error: "Invalid webhook" });
      }
    }
  );
}
