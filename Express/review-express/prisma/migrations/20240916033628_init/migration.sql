-- CreateTable
CREATE TABLE `Book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
