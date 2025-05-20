/*
  Warnings:

  - A unique constraint covering the columns `[userId,carId]` on the table `Favorites` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `favorites` ADD COLUMN `group` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Favorites_userId_carId_key` ON `Favorites`(`userId`, `carId`);
