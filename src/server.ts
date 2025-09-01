import app from "./app";
import config from "./config/config";
import { prisma } from "./shared";
// import { subDays } from "date-fns";

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

// const ACCOUNT_ID = "e6141f41-4236-402d-b221-ff32340528cb";
// const USER_ID = "01K3ZEJ12FF5TSH4XKM93VAKR6";

// // Categories with their typical amount ranges
// const CATEGORIES = {
//   INCOME: [
//     { name: "salary", range: [5000, 8000] },
//     { name: "freelance", range: [1000, 3000] },
//     { name: "investments", range: [500, 2000] },
//     { name: "other-income", range: [100, 1000] },
//   ],
//   EXPENSE: [
//     { name: "housing", range: [1000, 2000] },
//     { name: "transportation", range: [100, 500] },
//     { name: "groceries", range: [200, 600] },
//     { name: "utilities", range: [100, 300] },
//     { name: "entertainment", range: [50, 200] },
//     { name: "food", range: [50, 150] },
//     { name: "shopping", range: [100, 500] },
//     { name: "healthcare", range: [100, 1000] },
//     { name: "education", range: [200, 1000] },
//     { name: "travel", range: [500, 2000] },
//   ],
// };

// // Helper to generate random amount within a range
// function getRandomAmount(min, max) {
//   return Number((Math.random() * (max - min) + min).toFixed(2));
// }

// // Helper to get random category with amount
// function getRandomCategory(type) {
//   const categories = CATEGORIES[type];
//   const category = categories[Math.floor(Math.random() * categories.length)];
//   const amount = getRandomAmount(category.range[0], category.range[1]);
//   return { category: category.name, amount };
// }

// async function seedTransactions() {
//   try {
//     // Generate 90 days of transactions
//     const transactions = [];
//     let totalBalance = 0;

//     for (let i = 90; i >= 0; i--) {
//       const date = subDays(new Date(), i);

//       // Generate 1-3 transactions per day
//       const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

//       for (let j = 0; j < transactionsPerDay; j++) {
//         // 40% chance of income, 60% chance of expense
//         const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
//         const { category, amount } = getRandomCategory(type);

//         const transaction = {
//           id: crypto.randomUUID(),
//           type,
//           amount,
//           description: `${
//             type === "INCOME" ? "Received" : "Paid for"
//           } ${category}`,
//           date,
//           category,
//           status: "COMPLETED",
//           userId: USER_ID,
//           accountId: ACCOUNT_ID,
//           createdAt: date,
//           updatedAt: date,
//         };

//         totalBalance += type === "INCOME" ? amount : -amount;
//         transactions.push(transaction);
//       }
//     }

//     // Insert transactions in batches and update account balance
//     await prisma.$transaction(async (tx) => {
//       // Clear existing transactions
//       await tx.transaction.deleteMany({
//         where: { accountId: ACCOUNT_ID },
//       });

//       // Insert new transactions
//       await tx.transaction.createMany({
//         data: transactions,
//       });

//       // Update account balance
//       await tx.account.update({
//         where: { id: ACCOUNT_ID },
//         data: { balance: totalBalance },
//       });
//     });

//     return {
//       success: true,
//       message: `Created ${transactions.length} transactions`,
//     };
//   } catch (error) {
//     console.error("Error seeding transactions:", error);
//     return { success: false, error: error.message };
//   }
// }

main();
// seedTransactions()

// For Vercel deployment, export the app only
export default app;

// Run server locally only when NOT on Vercel
if (process.env.VERCEL !== "1") {
  const port = Number(config.port);
  app.listen(port, () => {
    console.log(`Server is running successfully on http://localhost:${port}`);
  });
}
