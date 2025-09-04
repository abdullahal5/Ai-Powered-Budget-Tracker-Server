-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "lastProcessed" TIMESTAMP(3),
ADD COLUMN     "nextRecurringDate" TIMESTAMP(3);
