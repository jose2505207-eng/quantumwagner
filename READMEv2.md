
# Quantum Wager V2 - Frontend Technical Specification
## Meme Token Launchpad + Battle Arena + Prediction Markets Platform

### 🎯 Frontend V2 Overview

**Platform Architecture**: Quantum Wager V2 frontend evolves into a comprehensive meme coin ecosystem with three integrated modules: Token Launchpad, Battle Arena, and Prediction Markets. The interface prioritizes mobile-first design, real-time updates, and gamification.

**Tech Stack**:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand + React Query
- **Wallet**: Solana Wallet Adapter
- **Blockchain**: Solana Web3.js + Anchor
- **Real-time**: Socket.io-client
- **Charts**: Recharts + Lightweight Charts
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

---

## 📁 Project Structure

```
quantum-wager-frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (landing)/
│   │   │   └── page.tsx          # Landing page
│   │   ├── launchpad/
│   │   │   ├── page.tsx          # Token discovery
│   │   │   ├── create/
│   │   │   │   └── page.tsx      # Create token
│   │   │   └── [mint]/
│   │   │       └── page.tsx      # Token detail
│   │   ├── fast-bets/
│   │   │   ├── page.tsx          # Fast Bet discovery & live
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Fast Bet detail
│   │   │   └── leaderboard/
│   │   │       └── page.tsx      # Fast Bet leaderboard
│   │   ├── battles/
│   │   │   ├── page.tsx          # Battle discovery
│   │   │   ├── create/
│   │   │   │   └── page.tsx      # Create battle (admin/high-rep)
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Battle detail
│   │   ├── markets/              # V1 Prediction Markets
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── portfolio/
│   │   │   └── page.tsx          # User portfolio
│   │   ├── reputation/
│   │   │   ├── page.tsx          # Leaderboard
│   │   │   └── [userId]/
│   │   │       └── page.tsx      # User profile
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── launchpad/
│   │   │   ├── TokenCard.tsx
│   │   │   ├── TokenChart.tsx
│   │   │   ├── BondingCurveChart.tsx
│   │   │   ├── TokenTradeForm.tsx
│   │   │   ├── CreatorDashboard.tsx
│   │   │   └── TokenFilters.tsx
│   │   ├── fast-bets/
│   │   │   ├── FastBetCard.tsx
│   │   │   ├── CurrentFastBet.tsx
│   │   │   ├── FastBetCountdown.tsx
│   │   │   ├── FastBetBetForm.tsx
│   │   │   ├── LivePriceChart.tsx
│   │   │   ├── FastBetResult.tsx
│   │   │   └── FastBetHistory.tsx
│   │   ├── battles/
│   │   │   ├── BattleCard.tsx
│   │   │   ├── BattleArena.tsx
│   │   │   ├── BattleStakeForm.tsx
│   │   │   ├── BattleLeaderboard.tsx
│   │   │   ├── LiveBattleTracker.tsx
│   │   │   └── BattleFilters.tsx
│   │   ├── reputation/
│   │   │   ├── ReputationBadge.tsx
│   │   │   ├── AchievementCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── LeaderboardTable.tsx
│   │   ├── markets/              # V1 Components
│   │   │   ├── MarketCard.tsx
│   │   │   ├── BetForm.tsx
│   │   │   └── OddsDisplay.tsx
│   │   ├── portfolio/
│   │   │   ├── PortfolioOverview.tsx
│   │   │   ├── PositionsList.tsx
│   │   │   ├── TokenHoldings.tsx
│   │   │   └── BattlePositions.tsx
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   └── shared/
│   │       ├── WalletButton.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── Notifications.tsx
│   ├── hooks/
│   │   ├── useTokenLaunch.ts
│   │   ├── useFastBet.ts
│   │   ├── useBattle.ts
│   │   ├── useReputation.ts
│   │   ├── useMarket.ts
│   │   ├── useWallet.ts
│   │   ├── useWebSocket.ts
│   │   └── useReferral.ts
│   ├── lib/
│   │   ├── solana/
│   │   │   ├── program.ts        # Anchor program interface
│   │   │   ├── transactions.ts   # Transaction builders
│   │   │   └── utils.ts
│   │   ├── api/
│   │   │   ├── client.ts         # API client
│   │   │   ├── tokens.ts
│   │   │   ├── battles.ts
│   │   │   ├── markets.ts
│   │   │   └── reputation.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       ├── validators.ts
│   │       └── constants.ts
│   ├── stores/
│   │   ├── walletStore.ts
│   │   ├── tokenStore.ts
│   │   ├── battleStore.ts
│   │   ├── marketStore.ts
│   │   └── uiStore.ts
│   └── types/
│       ├── token.ts
│       ├── battle.ts
│       ├── market.ts
│       ├── reputation.ts
│       └── common.ts
└── public/
    ├── images/
    ├── icons/
    └── sounds/              # Notification sounds
```

---

## 🎨 Core Pages & Components

### 1. Token Launchpad Pages

#### Token Discovery Page (`/launchpad`)
```tsx
// app/launchpad/page.tsx
'use client';

import { useState } from 'react';
import { useTokens } from '@/hooks/useTokens';
import { TokenCard } from '@/components/launchpad/TokenCard';
import { TokenFilters } from '@/components/launchpad/TokenFilters';

export default function LaunchpadPage() {
  const [filters, setFilters] = useState({
    sortBy: 'volume', // volume, marketCap, new, graduating
    category: 'all',
    battleEligible: false,
    search: ''
  });
  
  const { tokens, isLoading } = useTokens(filters);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Token Launchpad</h1>
        <p className="text-muted-foreground">
          Create, trade, and battle with meme coins
        </p>
      </div>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tokens" value="1,234" />
        <StatCard label="24h Volume" value="$2.4M" />
        <StatCard label="Active Battles" value="12" />
        <StatCard label="Total Users" value="15.2K" />
      </div>
      
      {/* Filters */}
      <TokenFilters filters={filters} onFilterChange={setFilters} />
      
      {/* Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map(token => (
          <TokenCard key={token.mint} token={token} />
        ))}
      </div>
    </div>
  );
}
```

#### Create Token Page (`/launchpad/create`)
```tsx
// app/launchpad/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCreateToken } from '@/hooks/useTokenLaunch';
import { TokenCreationForm } from '@/components/launchpad/TokenCreationForm';

export default function CreateTokenPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { createToken, isCreating } = useCreateToken();
  
  const handleSubmit = async (data: TokenCreationData) => {
    try {
      const token = await createToken(data);
      router.push(`/launchpad/${token.mint}`);
    } catch (error) {
      console.error('Token creation failed:', error);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Create Your Meme Token</h1>
      <p className="text-muted-foreground mb-8">
        Launch your token with automatic bonding curve and battle eligibility
      </p>
      
      {/* Creation Steps */}
      <div className="mb-8">
        <CreationSteps currentStep={1} />
      </div>
      
      {/* Form */}
      <TokenCreationForm 
        onSubmit={handleSubmit}
        isLoading={isCreating}
      />
      
      {/* Info Sidebar */}
      <div className="mt-8">
        <InfoCard title="How It Works">
          <ul className="space-y-2">
            <li>✓ Bonding curve starts at your set price</li>
            <li>✓ 5% tokens reserved for creator</li>
            <li>✓ Gradual unlocking based on market cap</li>
            <li>✓ Battle eligible at 500K market cap</li>
            <li>✓ Auto-migrates at 1M market cap</li>
          </ul>
        </InfoCard>
      </div>
    </div>
  );
}
```

#### Token Detail Page (`/launchpad/[mint]`)
```tsx
// app/launchpad/[mint]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useToken } from '@/hooks/useTokenLaunch';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TokenHeader } from '@/components/launchpad/TokenHeader';
import { TokenChart } from '@/components/launchpad/TokenChart';
import { TokenTradeForm } from '@/components/launchpad/TokenTradeForm';
import { TokenStats } from '@/components/launchpad/TokenStats';
import { RecentTrades } from '@/components/launchpad/RecentTrades';
import { CreatorInfo } from '@/components/launchpad/CreatorInfo';

export default function TokenDetailPage() {
  const { mint } = useParams();
  const { token, isLoading } = useToken(mint as string);
  
  // Real-time updates
  useWebSocket(`token:${mint}`, (event) => {
    if (event.type === 'price_update') {
      // Update token price in UI
    }
  });
  
  if (isLoading) return <LoadingSkeleton />;
  if (!token) return <NotFound />;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Token Header */}
      <TokenHeader token={token} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Price Chart */}
          <TokenChart tokenMint={mint as string} />
          
          {/* Stats Grid */}
          <TokenStats token={token} />
          
          {/* Recent Trades */}
          <RecentTrades tokenMint={mint as string} />
          
          {/* Battle History (if eligible) */}
          {token.battleEligible && (
            <BattleHistory tokenMint={mint as string} />
          )}
        </div>
        
        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          {/* Trade Form */}
          <TokenTradeForm token={token} />
          
          {/* Creator Info */}
          <CreatorInfo token={token} />
          
          {/* Progress Bars */}
          <ProgressCard title="Battle Eligibility">
            <ProgressBar 
              current={token.currentMarketCap}
              target={500_000}
              label="Market Cap"
            />
          </ProgressCard>
          
          <ProgressCard title="Migration Progress">
            <ProgressBar 
              current={token.currentMarketCap}
              target={1_000_000}
              label="Market Cap"
            />
          </ProgressCard>
          
          {/* Social Links */}
          <SocialLinks token={token} />
        </div>
      </div>
    </div>
  );
}
```

### 2. Battle Arena Pages

#### Battle Discovery Page (`/battles`)
```tsx
// app/battles/page.tsx
'use client';

import { useState } from 'react';
import { useBattles } from '@/hooks/useBattle';
import { BattleCard } from '@/components/battles/BattleCard';
import { BattleFilters } from '@/components/battles/BattleFilters';

export default function BattlesPage() {
  const [filters, setFilters] = useState({
    status: 'active', // active, upcoming, resolved
    category: 'all',
    sortBy: 'pool' // pool, participants, ending
  });
  
  const { battles, isLoading } = useBattles(filters);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Battle Arena</h1>
        <p className="text-muted-foreground">
          Stake on token battles and claim rewards
        </p>
      </div>
      
      {/* Featured Battle (if any) */}
      {battles.featured && (
        <FeaturedBattleCard battle={battles.featured} />
      )}
      
      {/* Filters */}
      <BattleFilters filters={filters} onFilterChange={setFilters} />
      
      {/* Battle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {battles.map(battle => (
          <BattleCard key={battle.id} battle={battle} />
        ))}
      </div>
    </div>
  );
}
```

#### Battle Detail Page (`/battles/[id]`)
```tsx
// app/battles/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useBattle } from '@/hooks/useBattle';
import { useWebSocket } from '@/hooks/useWebSocket';
import { BattleArena } from '@/components/battles/BattleArena';
import { BattleStakeForm } from '@/components/battles/BattleStakeForm';
import { BattleLeaderboard } from '@/components/battles/BattleLeaderboard';
import { LiveBattleTracker } from '@/components/battles/LiveBattleTracker';

export default function BattleDetailPage() {
  const { id } = useParams();
  const { battle, isLoading } = useBattle(id as string);
  
  // Real-time battle updates
  useWebSocket(`battle:${id}`, (event) => {
    if (event.type === 'pool_update') {
      // Update battle pools
    }
  });
  
  if (isLoading) return <LoadingSkeleton />;
  if (!battle) return <NotFound />;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Battle Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{battle.title}</h1>
            <p className="text-muted-foreground mt-2">
              {battle.description}
            </p>
          </div>
          <BattleStatusBadge status={battle.status} />
        </div>
      </div>
      
      {/* Battle Arena (Visual) */}
      <BattleArena battle={battle} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Tracker */}
          <LiveBattleTracker battle={battle} />
          
          {/* Leaderboard */}
          <BattleLeaderboard battleId={id as string} />
          
          {/* Token Performance */}
          <TokenPerformanceTable battle={battle} />
          
          {/* Activity Feed */}
          <BattleActivityFeed battleId={id as string} />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stake Form */}
          <BattleStakeForm battle={battle} />
          
          {/* Your Position (if any) */}
          <YourPositionCard battleId={id as string} />
          
          {/* Battle Stats */}
          <BattleStatsCard battle={battle} />
          
          {/* Prize Pool */}
          <PrizePoolCard battle={battle} />
          
          {/* Meta-Market Link */}
          {battle.metaMarketEnabled && (
            <MetaMarketCard marketId={battle.metaMarketId} />
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3. Fast Bet Pages

#### Fast Bet Hub Page (`/fast-bets`)
```tsx
// app/fast-bets/page.tsx
'use client';

import { useState } from 'react';
import { useCurrentFastBet, useUpcomingFastBet } from '@/hooks/useFastBet';
import { useWebSocket } from '@/hooks/useWebSocket';
import { CurrentFastBet } from '@/components/fast-bets/CurrentFastBet';
import { NextFastBetCountdown } from '@/components/fast-bets/NextFastBetCountdown';
import { FastBetHistory } from '@/components/fast-bets/FastBetHistory';

export default function FastBetsPage() {
  const { currentFastBet, isLoading: loadingCurrent } = useCurrentFastBet();
  const { upcomingFastBet } = useUpcomingFastBet();
  
  // Real-time updates for current Fast Bet
  useWebSocket('fast_bet:*', (event) => {
    // Handle real-time price updates, new bets, etc.
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">⚡ Fast Bets</h1>
        <p className="text-muted-foreground">
          Hourly high-speed prediction markets. Will it pump or dump 30% in 10 minutes?
        </p>
      </div>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Fast Bets" value="1,247" />
        <StatCard label="24h Volume" value="$2.4M" />
        <StatCard label="Active Players" value="3,421" />
        <StatCard label="Avg Pool Size" value="$48.2K" />
      </div>
      
      {/* Current Fast Bet (if active) */}
      {currentFastBet ? (
        <CurrentFastBet fastBet={currentFastBet} />
      ) : (
        <NextFastBetCountdown nextFastBet={upcomingFastBet} />
      )}
      
      {/* Recent Fast Bets */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Fast Bets</h2>
        <FastBetHistory limit={20} />
      </div>
      
      {/* Leaderboard Teaser */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Fast Bet Players</h2>
          <Link href="/fast-bets/leaderboard">
            <Button variant="outline">View Full Leaderboard →</Button>
          </Link>
        </div>
        <FastBetLeaderboardPreview limit={5} />
      </div>
    </div>
  );
}
```

#### Fast Bet Detail Page (`/fast-bets/[id]`)
```tsx
// app/fast-bets/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useFastBet } from '@/hooks/useFastBet';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FastBetHeader } from '@/components/fast-bets/FastBetHeader';
import { LivePriceChart } from '@/components/fast-bets/LivePriceChart';
import { FastBetBetForm } from '@/components/fast-bets/FastBetBetForm';
import { FastBetPositions } from '@/components/fast-bets/FastBetPositions';
import { FastBetResult } from '@/components/fast-bets/FastBetResult';

export default function FastBetDetailPage() {
  const { id } = useParams();
  const { fastBet, isLoading } = useFastBet(id as string);
  
  // Real-time updates
  useWebSocket(`fast_bet:${id}`, (event) => {
    if (event.type === 'pool_update') {
      // Update pools in real-time
    } else if (event.type === 'resolved') {
      // Show resolution animation
    }
  });
  
  if (isLoading) return <LoadingSkeleton />;
  if (!fastBet) return <NotFound />;
  
  const isResolved = fastBet.status === 'RESOLVED';
  const isOpen = fastBet.status === 'OPEN';
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Fast Bet Header */}
      <FastBetHeader fastBet={fastBet} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Price Chart */}
          <LivePriceChart fastBet={fastBet} />
          
          {/* Result (if resolved) */}
          {isResolved && <FastBetResult fastBet={fastBet} />}
          
          {/* Positions Table */}
          <FastBetPositions fastBetId={id as string} />
          
          {/* Token Info */}
          <TokenInfoCard tokenMint={fastBet.tokenMint} />
        </div>
        
        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          {/* Bet Form (if open) */}
          {isOpen && <FastBetBetForm fastBet={fastBet} />}
          
          {/* Your Position (if any) */}
          <YourFastBetPosition fastBetId={id as string} />
          
          {/* Fast Bet Stats */}
          <FastBetStatsCard fastBet={fastBet} />
          
          {/* Pool Distribution */}
          <PoolDistributionCard fastBet={fastBet} />
          
          {/* How It Works */}
          <HowFastBetsWork />
        </div>
      </div>
    </div>
  );
}
```

### 4. Reputation & Achievement Pages

#### Reputation Leaderboard (`/reputation`)
```tsx
// app/reputation/page.tsx
'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useReputation';
import { LeaderboardTable } from '@/components/reputation/LeaderboardTable';
import { LeaderboardFilters } from '@/components/reputation/LeaderboardFilters';

export default function ReputationPage() {
  const [filters, setFilters] = useState({
    timeRange: 'all_time', // daily, weekly, monthly, all_time
    metric: 'total_score' // total_score, volume, win_rate
  });
  
  const { leaderboard, userRank } = useLeaderboard(filters);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Reputation Leaderboard</h1>
      
      {/* Your Rank Card */}
      <YourRankCard rank={userRank} />
      
      {/* Filters */}
      <LeaderboardFilters filters={filters} onFilterChange={setFilters} />
      
      {/* Leaderboard Table */}
      <LeaderboardTable data={leaderboard} />
      
      {/* Achievement Showcase */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Achievements</h2>
        <AchievementGrid />
      </div>
    </div>
  );
}
```

#### User Profile Page (`/reputation/[userId]`)
```tsx
// app/reputation/[userId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useUserProfile } from '@/hooks/useReputation';
import { ReputationBadge } from '@/components/reputation/ReputationBadge';
import { AchievementCard } from '@/components/reputation/AchievementCard';
import { ProgressBar } from '@/components/reputation/ProgressBar';

export default function UserProfilePage() {
  const { userId } = useParams();
  const { profile, reputation, achievements } = useUserProfile(userId as string);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <Avatar user={profile} size="xl" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          <p className="text-muted-foreground">
            {profile.walletAddress}
          </p>
          <div className="flex gap-3 mt-4">
            <ReputationBadge score={reputation.totalScore} />
            <TierBadge tier={reputation.tier} />
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Volume" value={formatCurrency(reputation.totalTradingVolume)} />
        <StatCard label="Win Rate" value={`${reputation.predictionWinRate}%`} />
        <StatCard label="Tokens Created" value={reputation.tokensCreated} />
        <StatCard label="Battles Won" value={reputation.battlesWon} />
      </div>
      
      {/* Progress to Next Tier */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progress to Next Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar 
            current={reputation.totalScore}
            target={getNextTierThreshold(reputation.tier)}
            label="Reputation Score"
          />
        </CardContent>
      </Card>
      
      {/* Access Unlocks */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Platform Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AccessItem 
              label="Create Markets"
              unlocked={reputation.canCreateMarkets}
              requirement="7,500 reputation + 60% win rate"
            />
            <AccessItem 
              label="Create Battles"
              unlocked={reputation.canCreateBattles}
              requirement="10,000 reputation + 50% token success rate"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Achievements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
      
      {/* Activity History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline userId={userId as string} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Portfolio Page

#### Portfolio Dashboard (`/portfolio`)
```tsx
// app/portfolio/page.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { TokenHoldings } from '@/components/portfolio/TokenHoldings';
import { BattlePositions } from '@/components/portfolio/BattlePositions';
import { MarketPositions } from '@/components/portfolio/MarketPositions';

export default function PortfolioPage() {
  const { publicKey } = useWallet();
  const { portfolio, isLoading } = usePortfolio(publicKey?.toString());
  
  if (!publicKey) {
    return <ConnectWalletPrompt />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Portfolio</h1>
      
      {/* Overview */}
      <PortfolioOverview portfolio={portfolio} />
      
      {/* Tabs */}
      <Tabs defaultValue="tokens" className="mt-8">
        <TabsList>
          <TabsTrigger value="tokens">Token Holdings</TabsTrigger>
          <TabsTrigger value="battles">Battle Positions</TabsTrigger>
          <TabsTrigger value="markets">Market Positions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tokens">
          <TokenHoldings holdings={portfolio.tokens} />
        </TabsContent>
        
        <TabsContent value="battles">
          <BattlePositions positions={portfolio.battlePositions} />
        </TabsContent>
        
        <TabsContent value="markets">
          <MarketPositions positions={portfolio.marketPositions} />
        </TabsContent>
        
        <TabsContent value="history">
          <TransactionHistory userId={publicKey.toString()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🔧 Core Components

### Current Fast Bet Component
```tsx
// components/fast-bets/CurrentFastBet.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePlaceFastBet } from '@/hooks/useFastBet';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CurrentFastBet({ fastBet }: { fastBet: FastBet }) {
  const [betAmount, setBetAmount] = useState(10);
  const { placeFastBet, isPlacing } = usePlaceFastBet();
  
  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const closes = new Date(fastBet.betClosesAt).getTime();
      setTimeLeft(Math.max(0, Math.floor((closes - now) / 1000)));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [fastBet.betClosesAt]);
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Real-time pool updates
  const [pools, setPools] = useState({
    yes: fastBet.yesPool,
    no: fastBet.noPool
  });
  
  useWebSocket(`fast_bet:${fastBet.id}`, (event) => {
    if (event.type === 'pool_update') {
      setPools({ yes: event.yesPool, no: event.noPool });
    }
  });
  
  const totalPool = pools.yes + pools.no;
  const yesPercent = totalPool > 0 ? (pools.yes / totalPool) * 100 : 50;
  const noPercent = totalPool > 0 ? (pools.no / totalPool) * 100 : 50;
  
  const handleBet = async (side: 'YES' | 'NO') => {
    await placeFastBet({
      fastBetId: fastBet.id,
      side,
      amount: betAmount
    });
  };
  
  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            ⚡ LIVE: {fastBet.tokenSymbol}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
            <div className="text-2xl font-bold font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            Will {fastBet.tokenName} pump or dump 30% in 10 minutes?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Current Price: ${formatPrice(fastBet.currentPrice)}
          </p>
        </div>
        
        {/* Visual Pool Display */}
        <div className="relative h-32 bg-background rounded-lg overflow-hidden">
          {/* YES Side */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center transition-all duration-500"
            style={{ width: `${yesPercent}%` }}
          >
            <div className="text-center text-white">
              <div className="text-3xl font-bold">{yesPercent.toFixed(1)}%</div>
              <div className="text-sm">YES: {formatCurrency(pools.yes)}</div>
            </div>
          </div>
          
          {/* NO Side */}
          <div 
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-red-500 to-red-600 flex items-center justify-center transition-all duration-500"
            style={{ width: `${noPercent}%` }}
          >
            <div className="text-center text-white">
              <div className="text-3xl font-bold">{noPercent.toFixed(1)}%</div>
              <div className="text-sm">NO: {formatCurrency(pools.no)}</div>
            </div>
          </div>
          
          {/* Center Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-background transform -translate-x-1/2 z-10" />
        </div>
        
        {/* Bet Amount Input */}
        <div>
          <Label>Bet Amount (SOL)</Label>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min={1}
            max={1000}
            step={1}
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => setBetAmount(10)}>
              10 SOL
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBetAmount(25)}>
              25 SOL
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBetAmount(50)}>
              50 SOL
            </Button>
          </div>
        </div>
        
        {/* Bet Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleBet('YES')}
            disabled={isPlacing || timeLeft === 0}
          >
            📈 BET YES (+30%)
          </Button>
          <Button 
            size="lg" 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => handleBet('NO')}
            disabled={isPlacing || timeLeft === 0}
          >
            📉 BET NO (-30%)
          </Button>
        </div>
        
        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            ⚠️ HIGH RISK: If price moves less than ±30%, platform takes ALL bets from both sides!
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{fastBet.uniqueParticipants}</div>
            <div className="text-sm text-muted-foreground">Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(totalPool)}</div>
            <div className="text-sm text-muted-foreground">Total Pool</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">10m</div>
            <div className="text-sm text-muted-foreground">Resolution</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Fast Bet Result Component
```tsx
// components/fast-bets/FastBetResult.tsx
'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Confetti from 'react-confetti';

export function FastBetResult({ fastBet }: { fastBet: FastBet }) {
  const { outcome, priceChangeBps } = fastBet;
  const priceChangePercent = (priceChangeBps / 100).toFixed(2);
  
  const isYesWin = outcome === 'YES_WIN';
  const isNoWin = outcome === 'NO_WIN';
  const isNoResolution = outcome === 'NO_RESOLUTION';
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Confetti for wins */}
      {(isYesWin || isNoWin) && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <Card className={`border-2 ${
        isYesWin ? 'border-green-500 bg-green-500/10' :
        isNoWin ? 'border-red-500 bg-red-500/10' :
        'border-yellow-500 bg-yellow-500/10'
      }`}>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Fast Bet Resolved!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Outcome Icon */}
          <div className="flex justify-center">
            {isYesWin && (
              <CheckCircle className="w-24 h-24 text-green-500" />
            )}
            {isNoWin && (
              <XCircle className="w-24 h-24 text-red-500" />
            )}
            {isNoResolution && (
              <MinusCircle className="w-24 h-24 text-yellow-500" />
            )}
          </div>
          
          {/* Result Text */}
          <div className="text-center space-y-2">
            {isYesWin && (
              <>
                <h3 className="text-3xl font-bold text-green-500">
                  YES WINS! 🚀
                </h3>
                <p className="text-lg">
                  Price increased by <span className="font-bold text-green-500">+{priceChangePercent}%</span>
                </p>
              </>
            )}
            {isNoWin && (
              <>
                <h3 className="text-3xl font-bold text-red-500">
                  NO WINS! 📉
                </h3>
                <p className="text-lg">
                  Price decreased by <span className="font-bold text-red-500">{priceChangePercent}%</span>
                </p>
              </>
            )}
            {isNoResolution && (
              <>
                <h3 className="text-3xl font-bold text-red-500">
                  Platform Wins! 💰
                </h3>
                <p className="text-lg">
                  Price changed by only <span className="font-bold">{priceChangePercent}%</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Not enough movement - Platform takes all bets
                </p>
              </>
            )}
          </div>
          
          {/* Price Movement */}
          <div className="bg-background rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Opening Price</div>
                <div className="text-xl font-bold">${formatPrice(fastBet.openingPrice)}</div>
              </div>
              <div className="text-2xl">→</div>
              <div>
                <div className="text-sm text-muted-foreground">Closing Price</div>
                <div className="text-xl font-bold">${formatPrice(fastBet.closingPrice)}</div>
              </div>
            </div>
          </div>
          
          {/* Your Position (if any) */}
          <YourFastBetOutcome fastBetId={fastBet.id} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### Token Trade Form
```tsx
// components/launchpad/TokenTradeForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTokenTrade } from '@/hooks/useTokenLaunch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const tradeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  slippage: z.number().min(0).max(10).default(2)
});

export function TokenTradeForm({ token }: { token: TokenLaunch }) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const { buyToken, sellToken, isLoading, getQuote } = useTokenTrade();
  
  const form = useForm({
    resolver: zodResolver(tradeSchema),
    defaultValues: { amount: 0, slippage: 2 }
  });
  
  const amount = form.watch('amount');
  const { quote, isLoadingQuote } = getQuote(token.mint, amount, tradeType);
  
  const onSubmit = async (data: z.infer<typeof tradeSchema>) => {
    if (tradeType === 'buy') {
      await buyToken(token.mint, data.amount, data.slippage);
    } else {
      await sellToken(token.mint, data.amount, data.slippage);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade {token.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            {/* Amount Input */}
            <div>
              <Label>Amount (SOL)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => form.setValue('amount', 10)}>
                  10 SOL
                </Button>
                <Button size="sm" variant="outline" onClick={() => form.setValue('amount', 50)}>
                  50 SOL
                </Button>
                <Button size="sm" variant="outline" onClick={() => form.setValue('amount', 100)}>
                  100 SOL
                </Button>
              </div>
            </div>
            
            {/* Slippage */}
            <div>
              <Label>Slippage Tolerance (%)</Label>
              <Input
                type="number"
                step="0.1"
                {...form.register('slippage', { valueAsNumber: true })}
              />
            </div>
            
            {/* Quote Display */}
            {quote && (
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>You receive:</span>
                      <span className="font-bold">
                        {formatNumber(quote.tokensOut)} {token.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Price:</span>
                      <span>{formatCurrency(quote.price)} per token</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Trading Fee:</span>
                      <span>{formatCurrency(quote.tradingFee)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Creator Royalty:</span>
                      <span>{formatCurrency(quote.creatorRoyalty)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span>{formatCurrency(quote.totalCost)} SOL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading || !amount}
            >
              {isLoading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

### Battle Arena Visual Component
```tsx
// components/battles/BattleArena.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function BattleArena({ battle }: { battle: Battle }) {
  const sideAPercentage = (battle.sideAPool / battle.totalPool) * 100;
  const sideBPercentage = (battle.sideBPool / battle.totalPool) * 100;
  
  return (
    <Card className="p-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {battle.sideAName} VS {battle.sideBName}
        </h2>
        <CountdownTimer endTime={battle.endTime} />
      </div>
      
      {/* Visual Battle Display */}
      <div className="relative h-64 mb-8">
        {/* Side A */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-l-lg flex items-center justify-center"
          initial={{ width: '50%' }}
          animate={{ width: `${sideAPercentage}%` }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center text-white">
            <div className="text-4xl font-bold">{sideAPercentage.toFixed(1)}%</div>
            <div className="text-sm mt-2">{formatCurrency(battle.sideAPool)} SOL</div>
          </div>
        </motion.div>
        
        {/* Side B */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-red-500 to-red-600 rounded-r-lg flex items-center justify-center"
          initial={{ width: '50%' }}
          animate={{ width: `${sideBPercentage}%` }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center text-white">
            <div className="text-4xl font-bold">{sideBPercentage.toFixed(1)}%</div>
            <div className="text-sm mt-2">{formatCurrency(battle.sideBPool)} SOL</div>
          </div>
        </motion.div>
        
        {/* Center Divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-background transform -translate-x-1/2 z-10" />
        
        {/* VS Badge */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-background border-4 border-primary rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl">
            VS
          </div>
        </div>
      </div>
      
      {/* Token Lists */}
      <div className="grid grid-cols-2 gap-8">
        {/* Side A Tokens */}
        <div>
          <h3 className="font-semibold mb-3">{battle.sideAName} Tokens</h3>
          <div className="space-y-2">
            {battle.sideATokens.map(token => (
              <TokenBadge key={token.mint} token={token} />
            ))}
          </div>
        </div>
        
        {/* Side B Tokens */}
        <div>
          <h3 className="font-semibold mb-3">{battle.sideBName} Tokens</h3>
          <div className="space-y-2">
            {battle.sideBTokens.map(token => (
              <TokenBadge key={token.mint} token={token} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
```

### Achievement Card Component
```tsx
// components/reputation/AchievementCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityColors = {
    COMMON: 'bg-gray-500',
    RARE: 'bg-blue-500',
    EPIC: 'bg-purple-500',
    LEGENDARY: 'bg-yellow-500'
  };
  
  return (
    <Tooltip content={achievement.description}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`relative p-4 rounded-lg border-2 ${
          achievement.earned ? 'border-primary' : 'border-muted opacity-50'
        }`}
      >
        {/* Rarity Badge */}
        <Badge className={`absolute top-2 right-2 ${rarityColors[achievement.rarity]}`}>
          {achievement.rarity}
        </Badge>
        
        {/* Icon */}
        <div className="mb-3">
          <img 
            src={achievement.imageUri} 
            alt={achievement.name}
            className="w-16 h-16 mx-auto"
          />
        </div>
        
        {/* Name */}
        <h3 className="text-center font-semibold">{achievement.name}</h3>
        
        {/* Benefits */}
        {achievement.earned && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            {achievement.feeDiscountBps > 0 && (
              <div>-{achievement.feeDiscountBps / 100}% fees</div>
            )}
            {achievement.priorityAccess && (
              <div>Priority Access</div>
            )}
          </div>
        )}
        
        {/* Earned Date */}
        {achievement.earned && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            Earned {formatDate(achievement.earnedAt)}
          </div>
        )}
      </motion.div>
    </Tooltip>
  );
}
```

---

## 🔌 Custom Hooks

### useTokenLaunch Hook
```tsx
// hooks/useTokenLaunch.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { tokenApi } from '@/lib/api/tokens';
import { useProgram } from '@/lib/solana/program';

export function useTokenLaunch() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const program = useProgram();
  
  const createTokenMutation = useMutation({
    mutationFn: async (data: CreateTokenData) => {
      // Build transaction
      const tx = await program.methods
        .createToken(
          data.name,
          data.symbol,
          data.description,
          // ... other params
        )
        .accounts({
          creator: publicKey,
          // ... other accounts
        })
        .rpc();
      
      // Wait for confirmation
      await program.provider.connection.confirmTransaction(tx);
      
      // Store in backend
      return await tokenApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    }
  });
  
  return {
    createToken: createTokenMutation.mutateAsync,
    isCreating: createTokenMutation.isPending
  };
}

export function useToken(mint: string) {
  return useQuery({
    queryKey: ['token', mint],
    queryFn: () => tokenApi.get(mint),
    refetchInterval: 10000 // Refetch every 10 seconds
  });
}

export function useTokenTrade() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();
  const program = useProgram();
  
  const buyTokenMutation = useMutation({
    mutationFn: async ({ 
      mint, 
      solAmount, 
      slippage 
    }: BuyTokenParams) => {
      const minTokensOut = await calculateMinTokensOut(mint, solAmount, slippage);
      
      const tx = await program.methods
        .buyToken(
          new BN(solAmount * LAMPORTS_PER_SOL),
          new BN(minTokensOut)
        )
        .accounts({
          buyer: publicKey,
          tokenMint: mint,
          // ... other accounts
        })
        .transaction();
      
      const signature = await sendTransaction(tx, program.provider.connection);
      await program.provider.connection.confirmTransaction(signature);
      
      return signature;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['token', variables.mint] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    }
  });
  
  const getQuote = (mint: string, amount: number, type: 'buy' | 'sell') => {
    return useQuery({
      queryKey: ['quote', mint, amount, type],
      queryFn: () => tokenApi.getQuote(mint, amount, type),
      enabled: amount > 0
    });
  };
  
  return {
    buyToken: buyTokenMutation.mutateAsync,
    sellToken: () => {}, // Similar implementation
    isLoading: buyTokenMutation.isPending,
    getQuote
  };
}
```

### useFastBet Hook
```tsx
// hooks/useFastBet.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { fastBetApi } from '@/lib/api/fastBets';
import { useProgram } from '@/lib/solana/program';

export function useCurrentFastBet() {
  return useQuery({
    queryKey: ['fast-bet', 'current'],
    queryFn: () => fastBetApi.getCurrent(),
    refetchInterval: 5000 // Refetch every 5 seconds
  });
}

export function useUpcomingFastBet() {
  return useQuery({
    queryKey: ['fast-bet', 'upcoming'],
    queryFn: () => fastBetApi.getUpcoming(),
    refetchInterval: 10000
  });
}

export function useFastBet(fastBetId: string) {
  return useQuery({
    queryKey: ['fast-bet', fastBetId],
    queryFn: () => fastBetApi.get(fastBetId),
    refetchInterval: 2000 // Fast refetch for live updates
  });
}

export function useFastBetHistory(limit: number = 20) {
  return useQuery({
    queryKey: ['fast-bets', 'history', limit],
    queryFn: () => fastBetApi.getHistory(limit)
  });
}

export function usePlaceFastBet() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();
  const program = useProgram();
  
  const placeFastBetMutation = useMutation({
    mutationFn: async ({ 
      fastBetId, 
      side, 
      amount 
    }: PlaceFastBetParams) => {
      const tx = await program.methods
        .placeFastBet(
          side === 'YES' ? { yes: {} } : { no: {} },
          new BN(amount * LAMPORTS_PER_SOL)
        )
        .accounts({
          fastBet: fastBetId,
          user: publicKey,
          // ... other accounts
        })
        .transaction();
      
      const signature = await sendTransaction(tx, program.provider.connection);
      await program.provider.connection.confirmTransaction(signature);
      
      return signature;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fast-bet', variables.fastBetId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    }
  });
  
  return {
    placeFastBet: placeFastBetMutation.mutateAsync,
    isPlacing: placeFastBetMutation.isPending
  };
}

export function useClaimFastBetPayout() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();
  const program = useProgram();
  
  const claimMutation = useMutation({
    mutationFn: async (fastBetId: string) => {
      const tx = await program.methods
        .claimFastBetPayout()
        .accounts({
          fastBet: fastBetId,
          user: publicKey,
          // ... other accounts
        })
        .transaction();
      
      const signature = await sendTransaction(tx, program.provider.connection);
      await program.provider.connection.confirmTransaction(signature);
      
      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['fast-bets'] });
    }
  });
  
  return {
    claimPayout: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending
  };
}

export function useFastBetLeaderboard(timeRange: 'daily' | 'weekly' | 'all_time' = 'all_time') {
  return useQuery({
    queryKey: ['fast-bet-leaderboard', timeRange],
    queryFn: () => fastBetApi.getLeaderboard(timeRange)
  });
}
```

### useBattle Hook
```tsx
// hooks/useBattle.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { battleApi } from '@/lib/api/battles';
import { useProgram } from '@/lib/solana/program';

export function useBattle(battleId: string) {
  return useQuery({
    queryKey: ['battle', battleId],
    queryFn: () => battleApi.get(battleId),
    refetchInterval: 5000 // Refetch every 5 seconds for live updates
  });
}

export function useBattles(filters: BattleFilters) {
  return useQuery({
    queryKey: ['battles', filters],
    queryFn: () => battleApi.list(filters)
  });
}

export function useEnterBattle() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();
  const program = useProgram();
  
  const enterBattleMutation = useMutation({
    mutationFn: async ({ 
      battleId, 
      side, 
      amount 
    }: EnterBattleParams) => {
      const tx = await program.methods
        .enterBattle(side, new BN(amount * LAMPORTS_PER_SOL))
        .accounts({
          battle: battleId,
          user: publicKey,
          // ... other accounts
        })
        .transaction();
      
      const signature = await sendTransaction(tx, program.provider.connection);
      await program.provider.connection.confirmTransaction(signature);
      
      return signature;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['battle', variables.battleId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    }
  });
  
  return {
    enterBattle: enterBattleMutation.mutateAsync,
    isEntering: enterBattleMutation.isPending
  };
}

export function useClaimBattleRewards() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();
  const program = useProgram();
  
  const claimMutation = useMutation({
    mutationFn: async (battleId: string) => {
      const tx = await program.methods
        .claimBattlePayout()
        .accounts({
          battle: battleId,
          user: publicKey,
          // ... other accounts
        })
        .transaction();
      
      const signature = await sendTransaction(tx, program.provider.connection);
      await program.provider.connection.confirmTransaction(signature);
      
      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    }
  });
  
  return {
    claimRewards: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending
  };
}
```

### useReputation Hook
```tsx
// hooks/useReputation.ts
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { reputationApi } from '@/lib/api/reputation';

export function useReputation() {
  const { publicKey } = useWallet();
  
  return useQuery({
    queryKey: ['reputation', publicKey?.toString()],
    queryFn: () => reputationApi.get(publicKey!.toString()),
    enabled: !!publicKey
  });
}

export function useLeaderboard(filters: LeaderboardFilters) {
  const { publicKey } = useWallet();
  
  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', filters],
    queryFn: () => reputationApi.getLeaderboard(filters)
  });
  
  const userRankQuery = useQuery({
    queryKey: ['userRank', publicKey?.toString(), filters],
    queryFn: () => reputationApi.getUserRank(publicKey!.toString(), filters),
    enabled: !!publicKey
  });
  
  return {
    leaderboard: leaderboardQuery.data,
    userRank: userRankQuery.data,
    isLoading: leaderboardQuery.isLoading || userRankQuery.isLoading
  };
}

export function useAchievements() {
  const { publicKey } = useWallet();
  
  return useQuery({
    queryKey: ['achievements', publicKey?.toString()],
    queryFn: () => reputationApi.getAchievements(publicKey!.toString()),
    enabled: !!publicKey
  });
}
```

---

## 🔄 WebSocket Integration

### useWebSocket Hook
```tsx
// hooks/useWebSocket.ts
import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from '@solana/wallet-adapter-react';

let socket: Socket | null = null;

export function useWebSocket(channel: string, onEvent: (event: any) => void) {
  const { publicKey } = useWallet();
  
  useEffect(() => {
    // Initialize socket if not exists
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
        transports: ['websocket'],
        auth: {
          token: localStorage.getItem('auth_token')
        }
      });
    }
    
    // Subscribe to channel
    socket.emit(`subscribe:${channel.split(':')[0]}`, channel.split(':')[1]);
    
    // Listen for events
    socket.on(channel, onEvent);
    
    // Cleanup
    return () => {
      socket?.off(channel, onEvent);
    };
  }, [channel, onEvent]);
}

// Global WebSocket manager
export function useWebSocketManager() {
  const subscribeToToken = useCallback((tokenMint: string) => {
    socket?.emit('subscribe:token', tokenMint);
  }, []);
  
  const subscribeToBattle = useCallback((battleId: string) => {
    socket?.emit('subscribe:battle', battleId);
  }, []);
  
  const subscribeToUser = useCallback((userId: string) => {
    socket?.emit('subscribe:user', userId);
  }, []);
  
  return {
    subscribeToToken,
    subscribeToBattle,
    subscribeToUser
  };
}
```

---

## 📱 Responsive Design

### Mobile Optimizations
```tsx
// components/layout/MobileNav.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4">
          <MobileNavLink href="/launchpad" onClick={() => setOpen(false)}>
            Token Launchpad
          </MobileNavLink>
          <MobileNavLink href="/battles" onClick={() => setOpen(false)}>
            Battle Arena
          </MobileNavLink>
          <MobileNavLink href="/markets" onClick={() => setOpen(false)}>
            Prediction Markets
          </MobileNavLink>
          <MobileNavLink href="/portfolio" onClick={() => setOpen(false)}>
            Portfolio
          </MobileNavLink>
          <MobileNavLink href="/reputation" onClick={() => setOpen(false)}>
            Leaderboard
          </MobileNavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

---
