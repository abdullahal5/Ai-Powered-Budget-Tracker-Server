import { Inngest } from "inngest";
import { prisma } from "../shared";
import { emailSender } from "../utils/email";

export const inngest = new Inngest({ id: "my-app" });

const checkBudgetAlert = inngest.createFunction(
  { id: "check-budget-alerts", name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // every 6 hours
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await prisma.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startOfMonthUTC = new Date(
          Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
            0,
            0,
            0
          )
        );

        const endOfMonthUTC = new Date(
          Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
            23,
            59,
            59
          )
        );

        const expenses = await prisma.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startOfMonthUTC,
              lte: endOfMonthUTC,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() ?? 0;
        const budgetAmount = Number(budget.amount);

        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonthUTC(new Date(budget.lastAlertSent), new Date()))
        ) {
          const name = budget.user.name || "User";
          const month = currentDate.toLocaleString("default", {
            month: "long",
          });
          const spent = totalExpenses.toFixed(2);
          const budgetAmountStr = budgetAmount.toFixed(2);
          const remaining = (budgetAmount - totalExpenses).toFixed(2);
          const percent = percentageUsed.toFixed(0);
          const ctaUrl = `${process.env.APP_URL}/budgets/${budget.id}`;

          const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <div style="background-color: #1f7aff; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0;">Monthly Budget Alert</h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px;">
      <p style="font-size: 16px;">Hello <b>${name}</b>,</p>

      <p style="font-size: 16px;">
        You’ve used <b>${percent}%</b> of your budget for <b>${month}</b>.
      </p>

      <p style="font-size: 16px; font-weight: 500; color: #dc3545;">
        ⚠️ You’ve spent ৳${spent} out of ৳${budgetAmountStr}. Only ৳${remaining} remains for this month.
      </p>

      <p style="font-size: 16px;">
        Consider slowing down non-essential spending or reviewing your expenses. You can check detailed insights in your dashboard.
      </p>

      <!-- Button -->
      <div style="margin: 30px 0; text-align: center;">
        <a href="${ctaUrl}" style="background-color: #1f7aff; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 15px; display: inline-block;">
          View Budget Details
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 14px; color: #6c757d;">Stay in control of your finances 💡</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
      <p style="margin: 0;">© ${new Date().getFullYear()} Budget Tracker. All rights reserved.</p>
    </div>
  </div>
  `;

          await emailSender(budget.user.email, html);

          await prisma.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

function isNewMonthUTC(lastAlertDate: Date, currentDate: Date = new Date()) {
  return (
    lastAlertDate.getUTCMonth() !== currentDate.getUTCMonth() ||
    lastAlertDate.getUTCFullYear() !== currentDate.getUTCFullYear()
  );
}

export const functions = [checkBudgetAlert];
