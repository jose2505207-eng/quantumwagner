-- Enable Row Level Security (deny-by-default) on all public tables.
--
-- Applied as the table owner `app_user` (the role Prisma connects with via
-- DATABASE_URL). RLS is ENABLEd, NOT FORCEd: the owner bypasses non-forced RLS,
-- so the server-authoritative Prisma layer keeps full read/write access. The
-- `anon` and `authenticated` roles used by the Supabase client libraries /
-- PostgREST have no policies (and no table grants), so they are denied by
-- default. Defense-in-depth: even if the anon key leaked, these tables stay
-- locked. Access to app data remains exclusively through the in-repo backend.
--
-- To later expose any table to the Supabase REST/JS API, add explicit RLS
-- policies (and grants) for that table — do not disable RLS.

ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Wallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuthNonce" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PlayerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."XPEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Quest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."UserQuest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Streak" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Market" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Prediction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FastBet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FastBetEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MemeBattle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MemeBattleEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MemeBattleVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LaunchToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LeaderboardSeason" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LeaderboardEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OracleResolution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;
