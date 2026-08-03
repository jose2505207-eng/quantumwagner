"use client";

import { InfoPage, InfoSection, InfoNotice } from "@/components/info/InfoPage";

export default function PrivacyPolicy() {
  return (
    <InfoPage
      title="Privacy Policy"
      updated="Last updated: 3 August 2026"
      intro="What Quantum Wager collects, why, and what we never ask for."
    >
      <InfoNotice>
        <strong>Template pending legal review.</strong> This describes the data
        the platform actually handles today. It has not been reviewed by counsel
        and should be checked against the privacy law applying to your users
        before launch.
      </InfoNotice>

      <InfoSection heading="What we never collect">
        <p>
          We never ask for and never store your private key or seed phrase.
          Nobody at Quantum Wager can access your wallet or move your funds. We
          do not require an email address, a phone number, or a legal name to
          use the platform.
        </p>
      </InfoSection>

      <InfoSection heading="What we store">
        <ul>
          <li>
            <strong>Your wallet address.</strong> This is your identity on the
            platform. It is linked to your profile, XP, quests, streaks, and
            leaderboard standing.
          </li>
          <li>
            <strong>A username</strong>, if you choose to set one.
          </li>
          <li>
            <strong>Your activity</strong> — market positions, fast bets, battle
            entries and votes, tokens launched, and the resulting transaction
            signatures.
          </li>
          <li>
            <strong>Authentication records</strong> — a short-lived, single-use
            nonce that you sign to prove wallet ownership, and an audit log of
            privileged actions.
          </li>
        </ul>
      </InfoSection>

      <InfoSection heading="Cookies">
        <p>
          After you sign the login message we set one <code>httpOnly</code>{" "}
          session cookie so you stay signed in. It is strictly necessary for
          authentication. We do not use advertising or third-party tracking
          cookies.
        </p>
      </InfoSection>

      <InfoSection heading="The blockchain is public">
        <p>
          This is the most important thing to understand about privacy here.
          Every transaction you sign — every bet, battle entry, token purchase,
          and payout — is written to the Solana blockchain, which is public,
          permanent, and outside our control. We cannot edit or delete anything
          recorded on-chain, and anyone can inspect the full history of any
          wallet address.
        </p>
      </InfoSection>

      <InfoSection heading="Third parties we rely on">
        <ul>
          <li>
            <strong>Solana RPC providers</strong> — to read chain state and
            submit transactions. They may observe your IP address and the
            requests made.
          </li>
          <li>
            <strong>Price oracles</strong> — to resolve markets and fast bets
            against reference prices.
          </li>
          <li>
            <strong>Our hosting provider</strong> — which keeps standard server
            request logs.
          </li>
          <li>
            <strong>Your wallet provider</strong> — governed by its own privacy
            policy, not ours.
          </li>
        </ul>
      </InfoSection>

      <InfoSection heading="How we use it">
        <p>
          Only to run the platform: authenticating you, settling markets,
          computing XP and leaderboards, showing your portfolio, enforcing rate
          limits, and investigating abuse or manipulation. We do not sell your
          data or share it for advertising.
        </p>
      </InfoSection>

      <InfoSection heading="Retention and your choices">
        <p>
          Off-chain records are retained while your account is active. You can
          request deletion of your off-chain profile data through our{" "}
          <a href="/info/support">support page</a>. On-chain records cannot be
          deleted by anyone, including us. You can stop sharing new data at any
          time by disconnecting your wallet.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
