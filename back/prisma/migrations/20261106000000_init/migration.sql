-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('CREATOR', 'BUSINESS', 'AGENCY') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `listed` BOOLEAN NOT NULL DEFAULT false,
    `prefPush` BOOLEAN NOT NULL DEFAULT true,
    `prefEmail` BOOLEAN NOT NULL DEFAULT true,
    `prefWeekly` BOOLEAN NOT NULL DEFAULT false,
    `avatarFileId` VARCHAR(191) NULL,
    `coverFileId` VARCHAR(191) NULL,
    `failedLogins` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `User_publicId_key`(`publicId`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_listed_role_idx`(`listed`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailCode` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kind` ENUM('VERIFY', 'NEW_EMAIL') NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `newEmail` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `EmailCode_userId_kind_idx`(`userId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `familyId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `replacedById` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `RefreshToken_tokenHash_key`(`tokenHash`),
    INDEX `RefreshToken_userId_idx`(`userId`),
    INDEX `RefreshToken_familyId_idx`(`familyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreatorProfile` (
    `userId` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NULL,
    `birthDate` DATE NULL,
    `gender` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `uf` VARCHAR(191) NULL,
    `languages` JSON NOT NULL,
    `about` TEXT NULL,
    `instagram` VARCHAR(191) NULL,
    `tiktok` VARCHAR(191) NULL,
    `youtube` VARCHAR(191) NULL,
    `followersBand` VARCHAR(191) NULL,
    `networkStats` JSON NULL,
    `sizeBand` VARCHAR(191) NULL,
    `niches` JSON NOT NULL,
    `formats` JSON NOT NULL,
    `avgDelivery` VARCHAR(191) NULL,
    `priceReels` INTEGER NULL,
    `priceStories` INTEGER NULL,
    `priceTiktok` INTEGER NULL,
    `vminCents` INTEGER NULL,
    `vmaxCents` INTEGER NULL,
    `imageUse` VARCHAR(191) NULL,
    `showPrices` BOOLEAN NOT NULL DEFAULT true,
    `acceptBelowMin` BOOLEAN NOT NULL DEFAULT false,
    `audAges` JSON NOT NULL,
    `audGender` VARCHAR(191) NULL,
    `audRegion` VARCHAR(191) NULL,
    `audInterests` JSON NOT NULL,
    `nearPelotas` BOOLEAN NOT NULL DEFAULT false,
    `ratingAvg` DOUBLE NOT NULL DEFAULT 0,
    `jobsCount` INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyProfile` (
    `userId` VARCHAR(191) NOT NULL,
    `tradeName` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NULL,
    `responsible` VARCHAR(191) NULL,
    `foundedAt` DATE NULL,
    `segment` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `uf` VARCHAR(191) NULL,
    `about` TEXT NULL,
    `instagram` VARCHAR(191) NULL,
    `site` VARCHAR(191) NULL,
    `channels` JSON NOT NULL,
    `audAges` JSON NOT NULL,
    `audGender` VARCHAR(191) NULL,
    `audRegion` VARCHAR(191) NULL,
    `audInterests` JSON NOT NULL,
    `desiredFormats` JSON NOT NULL,
    `budget` VARCHAR(191) NULL,
    `creatorSizes` JSON NOT NULL,
    `creatorNiches` JSON NOT NULL,
    `services` JSON NOT NULL,
    `teamSize` VARCHAR(191) NULL,
    `clientSegments` JSON NOT NULL,
    `clientsRange` VARCHAR(191) NULL,
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgencyClient` (
    `id` VARCHAR(191) NOT NULL,
    `agencyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `segment` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `AgencyClient_agencyId_idx`(`agencyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PortfolioItem` (
    `id` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `views` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `PortfolioItem_creatorId_idx`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `brandName` VARCHAR(191) NOT NULL,
    `segment` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `product` VARCHAR(191) NOT NULL,
    `objective` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `cta` VARCHAR(191) NULL,
    `data` JSON NOT NULL,
    `generated` JSON NOT NULL,
    `requirements` JSON NOT NULL,
    `valueCents` INTEGER NOT NULL,
    `videos` INTEGER NOT NULL,
    `creatorsQty` INTEGER NOT NULL,
    `deliveryDate` DATE NOT NULL,
    `exclusiveDays` INTEGER NOT NULL DEFAULT 0,
    `imageUse` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'OPEN') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Campaign_ownerId_idx`(`ownerId`),
    INDEX `Campaign_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proposal` (
    `id` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` VARCHAR(191) NOT NULL,
    `contractorId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'ACCEPTED', 'CONTRACT', 'DECLINED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `origin` ENUM('INVITE', 'APPLICATION') NOT NULL DEFAULT 'INVITE',
    `brandName` VARCHAR(191) NOT NULL,
    `clientName` VARCHAR(191) NULL,
    `segment` VARCHAR(191) NOT NULL,
    `exclusiveDays` INTEGER NOT NULL DEFAULT 0,
    `videos` INTEGER NOT NULL DEFAULT 1,
    `campaignName` VARCHAR(191) NOT NULL,
    `objective` VARCHAR(191) NOT NULL,
    `format` VARCHAR(191) NOT NULL,
    `unreadCreator` BOOLEAN NOT NULL DEFAULT false,
    `unreadContractor` BOOLEAN NOT NULL DEFAULT false,
    `acceptedBy` ENUM('C', 'K') NULL,
    `acceptedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Proposal_number_key`(`number`),
    INDEX `Proposal_contractorId_idx`(`contractorId`),
    INDEX `Proposal_creatorId_idx`(`creatorId`),
    INDEX `Proposal_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProposalRound` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `seq` INTEGER NOT NULL,
    `by` ENUM('C', 'K') NOT NULL,
    `valueCents` INTEGER NOT NULL,
    `deliveryDate` DATE NOT NULL,
    `imageUse` VARCHAR(191) NOT NULL,
    `message` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `ProposalRound_proposalId_seq_key`(`proposalId`, `seq`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `by` ENUM('C', 'K', 'S') NOT NULL,
    `text` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Message_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wallet` (
    `userId` VARCHAR(191) NOT NULL,
    `balanceCents` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MoneyTx` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kind` ENUM('RECHARGE', 'CONTRACT', 'WITHDRAWAL') NOT NULL,
    `status` ENUM('PENDENTE', 'CONCLUIDO', 'RECUSADO', 'EXPIRADO', 'CUSTODIA', 'LIBERADO', 'PROCESSANDO', 'FALHOU') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `counterparty` VARCHAR(191) NULL,
    `valueCents` INTEGER NOT NULL,
    `feeCents` INTEGER NOT NULL DEFAULT 0,
    `totalCents` INTEGER NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `e2e` VARCHAR(191) NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `gatewayRef` VARCHAR(191) NULL,
    `contractId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `MoneyTx_idempotencyKey_key`(`idempotencyKey`),
    UNIQUE INDEX `MoneyTx_contractId_key`(`contractId`),
    INDEX `MoneyTx_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `MoneyTx_gatewayRef_idx`(`gatewayRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedCard` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `gatewayRef` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `last4` VARCHAR(191) NOT NULL,
    `exp` VARCHAR(191) NOT NULL,
    `holder` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `SavedCard_userId_gatewayRef_key`(`userId`, `gatewayRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LedgerEntry` (
    `id` VARCHAR(191) NOT NULL,
    `walletUserId` VARCHAR(191) NOT NULL,
    `txId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `balanceAfterCents` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `LedgerEntry_walletUserId_createdAt_idx`(`walletUserId`, `createdAt`),
    INDEX `LedgerEntry_txId_idx`(`txId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Escrow` (
    `id` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `payerId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `status` ENUM('HELD', 'RELEASED') NOT NULL DEFAULT 'HELD',
    `releasedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Escrow_contractId_key`(`contractId`),
    INDEX `Escrow_creatorId_status_idx`(`creatorId`, `status`),
    INDEX `Escrow_payerId_status_idx`(`payerId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contract` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `contractorId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `valueCents` INTEGER NOT NULL,
    `feeCents` INTEGER NOT NULL,
    `totalCents` INTEGER NOT NULL,
    `deliveryDate` DATE NOT NULL,
    `imageUse` VARCHAR(191) NOT NULL,
    `exclusiveDays` INTEGER NOT NULL DEFAULT 0,
    `segment` VARCHAR(191) NOT NULL,
    `brandName` VARCHAR(191) NOT NULL,
    `contractorPaidAt` DATETIME(3) NOT NULL,
    `snapshot` JSON NULL,
    `sha256` VARCHAR(191) NULL,
    `contractorSig` JSON NULL,
    `creatorSig` JSON NULL,
    `signedAt` DATETIME(3) NULL,
    `pdfKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Contract_number_key`(`number`),
    UNIQUE INDEX `Contract_proposalId_key`(`proposalId`),
    INDEX `Contract_contractorId_idx`(`contractorId`),
    INDEX `Contract_creatorId_idx`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Delivery` (
    `id` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `state` ENUM('PROD', 'IA', 'APROV', 'APROVADO', 'LIBERADO') NOT NULL DEFAULT 'PROD',
    `adjustCount` INTEGER NOT NULL DEFAULT 0,
    `adjustComment` TEXT NULL,
    `publishUrl` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `releasedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Delivery_contractId_key`(`contractId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `id` VARCHAR(191) NOT NULL,
    `deliveryId` VARCHAR(191) NOT NULL,
    `n` INTEGER NOT NULL,
    `kind` ENUM('VIDEO', 'POST') NOT NULL,
    `fileId` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `fileSize` INTEGER NULL,
    `url` VARCHAR(191) NULL,
    `durationSec` DOUBLE NULL,
    `aiStatus` ENUM('PENDING', 'DONE', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `aiResult` JSON NULL,
    `aiScore` INTEGER NULL,
    `aiOk` BOOLEAN NULL,
    `decision` VARCHAR(191) NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Submission_deliveryId_n_key`(`deliveryId`, `n`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoredFile` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NULL,
    `mime` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `sha256` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `StoredFile_storageKey_key`(`storageKey`),
    INDEX `StoredFile_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PublicationCheck` (
    `id` VARCHAR(191) NOT NULL,
    `deliveryId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `state` ENUM('PENDING', 'CONFIRMED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `runAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `PublicationCheck_state_runAt_idx`(`state`, `runAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `targetUserId` VARCHAR(191) NOT NULL,
    `stars` INTEGER NOT NULL,
    `tags` JSON NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Review_authorId_targetUserId_key`(`authorId`, `targetUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsArticle` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `publishedAt` DATETIME(3) NOT NULL,
    `readMins` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `paragraphs` JSON NOT NULL,
    UNIQUE INDEX `NewsArticle_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `protocol` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `profile` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `ContactMessage_protocol_key`(`protocol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataRequest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kind` ENUM('EXPORT', 'DELETE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `WebhookEvent_source_eventId_key`(`source`, `eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmailCode` ADD CONSTRAINT `EmailCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreatorProfile` ADD CONSTRAINT `CreatorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyProfile` ADD CONSTRAINT `CompanyProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgencyClient` ADD CONSTRAINT `AgencyClient_agencyId_fkey` FOREIGN KEY (`agencyId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PortfolioItem` ADD CONSTRAINT `PortfolioItem_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `AgencyClient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProposalRound` ADD CONSTRAINT `ProposalRound_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MoneyTx` ADD CONSTRAINT `MoneyTx_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MoneyTx` ADD CONSTRAINT `MoneyTx_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedCard` ADD CONSTRAINT `SavedCard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_walletUserId_fkey` FOREIGN KEY (`walletUserId`) REFERENCES `Wallet`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Escrow` ADD CONSTRAINT `Escrow_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Delivery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PublicationCheck` ADD CONSTRAINT `PublicationCheck_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Delivery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_targetUserId_fkey` FOREIGN KEY (`targetUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DataRequest` ADD CONSTRAINT `DataRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
