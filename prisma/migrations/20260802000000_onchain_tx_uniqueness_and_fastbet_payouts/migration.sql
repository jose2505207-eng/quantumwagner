-- AlterTable
ALTER TABLE "FastBetEntry" ADD COLUMN     "payoutError" TEXT,
ADD COLUMN     "payoutTxSignature" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FastBetEntry_txSignature_key" ON "FastBetEntry"("txSignature");

-- CreateIndex
CREATE UNIQUE INDEX "FastBetEntry_payoutTxSignature_key" ON "FastBetEntry"("payoutTxSignature");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_txSignature_key" ON "Prediction"("txSignature");

