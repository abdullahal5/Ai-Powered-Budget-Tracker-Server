import { Application, Request, Response } from "express";
import { Webhook } from "svix";
import { raw } from "express";
import { prisma } from "../../shared";
import config from "../../config/config";

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

        if (evt.type === "user.created") {
          const { id, email_addresses, first_name, last_name, image_url } =
            evt.data;

          const existingUser = await prisma.user.findUnique({
            where: { clerkUserId: id },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                clerkUserId: id,
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}` || "Unknown",
                imageUrl: image_url || "",
              },
            });
          }
        }

        res.status(200).json({ received: true });
      } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Invalid webhook" });
      }
    }
  );
}
