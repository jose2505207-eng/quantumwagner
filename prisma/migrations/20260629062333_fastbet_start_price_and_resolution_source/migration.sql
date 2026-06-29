-- Add baseline price + resolution source to FastBet for honest Pyth auto-resolve.
-- startPrice: price-feed value captured at round creation (null => not auto-resolvable).
-- resolutionSource: how the round was settled, e.g. "provider:pyth" or "admin".
-- AlterTable
ALTER TABLE "FastBet" ADD COLUMN     "resolutionSource" TEXT,
ADD COLUMN     "startPrice" DOUBLE PRECISION;
