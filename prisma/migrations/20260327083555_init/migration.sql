-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aviationNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "companyAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "companyName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "confirmPassword" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '';
