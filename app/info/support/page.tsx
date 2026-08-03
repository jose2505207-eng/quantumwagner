"use client";

import Link from "next/link";
import { InfoPage, InfoSection, InfoNotice } from "@/components/info/InfoPage";

export default function Support() {
  return (
    <InfoPage
      title="Support"
      intro="Common problems, and how to reach a human when the answer isn't here."
    >
      <InfoNotice>
        <strong>Contact channels not configured.</strong> The repository does
        not define a support email, Discord, or issue tracker, so none is
        listed below. Add your real channels to{" "}
        <code>app/info/support/page.tsx</code> before launch — an unreachable
        support page is worse than none.
      </InfoNotice>

      <InfoSection heading="My wallet won't connect">
        <ul>
          <li>
            Make sure your wallet extension is unlocked and set to{" "}
            <strong>Devnet</strong>. Quantum Wager runs on Solana Devnet, and a
            wallet pointed at Mainnet will fail to connect or show no balance.
          </li>
          <li>Refresh the page after switching networks.</li>
          <li>
            If the wallet menu shows an address but actions still fail,
            disconnect and reconnect to re-sign the login message.
          </li>
        </ul>
      </InfoSection>

      <InfoSection heading="I have no SOL to bet with">
        <p>
          Devnet SOL is free and has no monetary value. Request some from a
          Solana Devnet faucet using your wallet address, then refresh.
        </p>
      </InfoSection>

      <InfoSection heading="My transaction failed">
        <ul>
          <li>
            <strong>Rejected in wallet</strong> — you declined the signature
            prompt. Retry and approve it.
          </li>
          <li>
            <strong>Insufficient funds</strong> — you need the stake plus a
            small amount for network fees.
          </li>
          <li>
            <strong>Below the minimum</strong> — markets and battles enforce a
            minimum stake, shown on the bet form.
          </li>
          <li>
            <strong>Battle not accepting bets</strong> — it either hasn&apos;t
            started or has already ended. The status badge on the battle page
            shows which.
          </li>
        </ul>
      </InfoSection>

      <InfoSection heading="A page says it can't reach a service">
        <p>
          That means the backend API is unavailable, not that your funds are
          affected — your positions live on-chain and in our database, and
          nothing is lost. Wait a moment and retry. If it persists, report it
          with the page you were on and the time it happened.
        </p>
      </InfoSection>

      <InfoSection heading="My bet doesn't show in my portfolio">
        <p>
          Confirm the transaction succeeded in your wallet&apos;s activity
          history first. On-chain confirmation can lag briefly behind the UI;
          reload the portfolio page after a few seconds. If the transaction
          confirmed but the position is still missing after a minute, report it
          with the transaction signature.
        </p>
      </InfoSection>

      <InfoSection heading="Reporting a security issue">
        <p>
          Please do not open a public issue for a vulnerability. Follow the
          disclosure process in the project&apos;s <code>SECURITY.md</code>.
        </p>
      </InfoSection>

      <InfoSection heading="More reading">
        <ul>
          <li>
            <Link href="/how-it-works">How Quantum Wager works</Link>
          </li>
          <li>
            <Link href="/info/terms_of_services">Terms of Service</Link>
          </li>
          <li>
            <Link href="/info/privacy_policy">Privacy Policy</Link>
          </li>
        </ul>
      </InfoSection>
    </InfoPage>
  );
}
