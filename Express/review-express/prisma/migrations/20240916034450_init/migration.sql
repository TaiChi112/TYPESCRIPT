/*
  Warnings:

  - You are about to drop the column `desc` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `book` table. All the data in the column will be lost.
  - Added the required column `title` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `book` DROP COLUMN `desc`,
    DROP COLUMN `name`,
    DROP COLUMN `price`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
