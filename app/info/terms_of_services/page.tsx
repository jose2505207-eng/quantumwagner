"use client";

import { InfoPage, InfoSection, InfoNotice } from "@/components/info/InfoPage";

export default function TermsOfService() {
  return (
    <InfoPage
      title="Terms of Service"
      updated="Last updated: 3 August 2026"
      intro="These terms govern your use of Quantum Wager. By connecting a wallet or interacting with the platform, you agree to them."
    >
      <InfoNotice>
        <strong>Template pending legal review.</strong> This document describes
        how the platform currently works, but it has not been reviewed by
        counsel. It must be reviewed and adapted before Quantum Wager handles
        assets of real monetary value.
      </InfoNotice>

      <InfoSection heading="1. What Quantum Wager is">
        <p>
          Quantum Wager is a non-custodial prediction market and token launch
          platform built on Solana. It lets you take positions on the outcome of
          events, enter head-to-head token battles, and launch or trade tokens
          on a bonding curve.
        </p>
        <p>
          The platform currently runs on <strong>Solana Devnet</strong>. Devnet
          SOL is a test asset with no monetary value and is obtained free from a
          faucet. Nothing on the platform is an offer of a real-money wagering
          service.
        </p>
      </InfoSection>

      <InfoSection heading="2. Eligibility">
        <p>
          You must be of legal age in your jurisdiction and legally permitted to
          use a prediction market or skill-based forecasting service. You are
          responsible for determining whether your use is lawful where you live.
          We may restrict access from jurisdictions where the platform may not
          lawfully operate.
        </p>
      </InfoSection>

      <InfoSection heading="3. Your wallet and your keys">
        <p>
          Quantum Wager is non-custodial. We never take custody of your private
          keys or seed phrase, and we can never recover them for you. You are
          solely responsible for:
        </p>
        <ul>
          <li>Keeping your private keys and seed phrase secure.</li>
          <li>Every transaction you sign, including its cost and its outcome.</li>
          <li>
            Verifying transaction details in your wallet before approving them.
          </li>
        </ul>
        <p>
          A transaction confirmed on-chain is final. We cannot reverse, cancel,
          or refund it.
        </p>
      </InfoSection>

      <InfoSection heading="4. Markets, battles, and resolution">
        <p>
          Markets resolve according to the resolution criteria published on each
          market, using the oracle or resolution source stated there. Where a
          market is resolved by a platform administrator, that decision is made
          in good faith against the published criteria.
        </p>
        <p>
          Payouts are proportional to your contribution to the winning side,
          less any platform fee disclosed at the time you enter. Where a market
          is cancelled or cannot be resolved, stakes are returned to
          participants.
        </p>
      </InfoSection>

      <InfoSection heading="5. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>
            Manipulate market outcomes, wash trade, or coordinate to distort
            prices or resolution.
          </li>
          <li>
            Use the platform to launder funds or to finance unlawful activity.
          </li>
          <li>
            Attack, overload, or attempt to gain unauthorised access to the
            platform or its infrastructure.
          </li>
          <li>
            Create markets on outcomes that depend on harming an identifiable
            person.
          </li>
        </ul>
      </InfoSection>

      <InfoSection heading="6. Tokens launched on the platform">
        <p>
          Anyone can launch a token. A token appearing on Quantum Wager is not
          an endorsement, and we do not vet, audit, or vouch for any token, its
          creator, or its claims. Token launches carry a severe risk of total
          loss. Do your own research.
        </p>
      </InfoSection>

      <InfoSection heading="7. No financial advice">
        <p>
          Nothing on the platform is financial, investment, legal, or tax
          advice. Prices, odds, and statistics are provided for information only
          and may be inaccurate or delayed.
        </p>
      </InfoSection>

      <InfoSection heading="8. Availability and changes">
        <p>
          The platform is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;. We do not guarantee uninterrupted access, and we may
          modify, suspend, or discontinue any part of it. Smart contracts may
          contain bugs; on-chain interactions are at your own risk.
        </p>
      </InfoSection>

      <InfoSection heading="9. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Quantum Wager and its
          contributors are not liable for any indirect, incidental, or
          consequential loss, or for any loss of funds, tokens, profits, or data
          arising from your use of the platform.
        </p>
      </InfoSection>

      <InfoSection heading="10. Contact">
        <p>
          Questions about these terms can be raised through our{" "}
          <a href="/info/support">support page</a>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
