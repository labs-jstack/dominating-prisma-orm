-- AlterTable
ALTER TABLE "users" ADD COLUMN     "affiliatedId" UUID;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_affiliatedId_fkey" FOREIGN KEY ("affiliatedId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
