import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicKey } from "@solana/web3.js";

// ---------------------------------------------------------------------------
// Specs for app/battlearena/new/page.tsx — the token/opponent selector that
// carried the Loop-6 PublicKey-vs-string bug. The selector keeps `selected` as
// a base58 STRING and compares `t.account.tokenMint.toString() === selected`.
// The old bug stored the PublicKey OBJECT into string state, so the comparison
// (string === PublicKey) never matched and a chosen token never registered.
//
// We render real @solana/web3.js PublicKeys in the fixtures so a regression to
// object-typed state would once again fail the equality check — these specs
// would catch it. All Solana/wallet/network/methods deps are mocked; DB-free.
// ---------------------------------------------------------------------------

// Real, valid base58 mints so `.toString()` yields a base58 string and
// `new PublicKey(string)` round-trips downstream.
const BULL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const BEAR_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const BULL_ACCT = new PublicKey("11111111111111111111111111111111");
const BEAR_ACCT = new PublicKey("Sysvar1111111111111111111111111111111111111");

const TOKENS = [
  {
    publicKey: BULL_ACCT,
    account: {
      tokenMint: BULL_MINT,
      name: "Bull Coin",
      symbol: "BULL",
      imageUri: "",
    },
  },
  {
    publicKey: BEAR_ACCT,
    account: {
      tokenMint: BEAR_MINT,
      name: "Bear Coin",
      symbol: "BEAR",
      imageUri: "",
    },
  },
];

// --- Mocks -----------------------------------------------------------------
const createBattle = vi.fn();

vi.mock("@/app/utils/methods", () => ({
  default: () => ({ createBattle }),
}));

let tokensState: {
  tokens: typeof TOKENS;
  loading: boolean;
  error: string | null;
} = { tokens: TOKENS, loading: false, error: null };

vi.mock("@/app/utils/useAllTokens", () => ({
  useAllTokens: () => tokensState,
}));

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({ publicKey: new PublicKey("11111111111111111111111111111111") }),
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import CreateBattlePage from "@/app/battlearena/new/page";

beforeEach(() => {
  createBattle.mockReset();
  tokensState = { tokens: TOKENS, loading: false, error: null };
});

async function gotoContestants(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /contestants/i }));
}

describe("battlearena/new TokenSelector", () => {
  it("renders the decoded token option labels (symbol + name)", async () => {
    const user = userEvent.setup();
    render(<CreateBattlePage />);
    await gotoContestants(user);

    // Open the first (Side A) selector.
    await user.click(screen.getAllByRole("button", { name: /select a token/i })[0]);

    expect(await screen.findByText("Bull Coin")).toBeInTheDocument();
    expect(screen.getByText("Bear Coin")).toBeInTheDocument();
    // Option buttons carry the symbol.
    expect(screen.getByRole("button", { name: /BULL/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /BEAR/ })).toBeInTheDocument();
  });

  it("registers a selection — the trigger reflects the chosen token (guards the PublicKey/string bug)", async () => {
    const user = userEvent.setup();
    render(<CreateBattlePage />);
    await gotoContestants(user);

    const triggers = screen.getAllByRole("button", { name: /select a token/i });
    expect(triggers).toHaveLength(2);

    // Open Side A and pick BULL.
    await user.click(triggers[0]);
    await user.click(await screen.findByRole("button", { name: /BULL/ }));

    // The Side A trigger must now display the chosen token. With the old bug
    // (PublicKey object in string state) `find(...toString() === selected)`
    // returns undefined and the trigger would still read "Select a token...".
    await waitFor(() =>
      expect(
        screen.queryAllByRole("button", { name: /select a token/i })
      ).toHaveLength(1)
    );
  });

  it("passes a correctly-typed PublicKey (not a string, not stale) downstream to createBattle", async () => {
    const user = userEvent.setup();
    createBattle.mockResolvedValue({ battlePDA: { toBase58: () => "BATTLEPDA123" } });

    const { container } = render(<CreateBattlePage />);

    // Basics
    await user.type(screen.getByPlaceholderText("e.g. Solana vs Ethereum"), "Bulls vs Bears");
    await user.type(
      screen.getByPlaceholderText("Describe the battle conditions..."),
      "Who wins the clash"
    );
    await user.type(screen.getByPlaceholderText("https://..."), "https://img.example/x.png");

    // Contestants
    await gotoContestants(user);
    await user.type(screen.getByPlaceholderText("e.g. The Bulls"), "The Bulls");
    await user.type(screen.getByPlaceholderText("e.g. The Bears"), "The Bears");

    // Select Side A -> BULL.
    await user.click(screen.getAllByRole("button", { name: /select a token/i })[0]);
    await user.click(await screen.findByRole("button", { name: /BULL/ }));
    // Select Side B -> BEAR (only one selector still unset).
    await user.click(screen.getByRole("button", { name: /select a token/i }));
    await user.click(await screen.findByRole("button", { name: /BEAR/ }));

    // Schedule — set far-future start/end via the datetime-local inputs.
    await user.click(screen.getByRole("button", { name: /schedule/i }));
    const dts = container.querySelectorAll('input[type="datetime-local"]');
    expect(dts).toHaveLength(2);
    fireEvent.change(dts[0], { target: { value: "2030-01-01T10:00" } });
    fireEvent.change(dts[1], { target: { value: "2030-01-01T12:00" } });

    await user.click(screen.getByRole("button", { name: /create battle/i }));

    await waitFor(() => expect(createBattle).toHaveBeenCalledTimes(1));
    const arg = createBattle.mock.calls[0][0];

    // Side A/B tokens are PublicKey instances reconstructed from the selected
    // base58 string — not the raw string, and mapped to the correct side.
    expect(arg.sideATokens[0]).toBeInstanceOf(PublicKey);
    expect(arg.sideBTokens[0]).toBeInstanceOf(PublicKey);
    expect(arg.sideATokens[0].toBase58()).toBe(BULL_MINT.toBase58());
    expect(arg.sideBTokens[0].toBase58()).toBe(BEAR_MINT.toBase58());
    expect(arg.sideAName).toBe("The Bulls");
    expect(arg.sideBName).toBe("The Bears");
  });

  it("shows the loading state inside the dropdown while tokens load", async () => {
    tokensState = { tokens: [], loading: true, error: null };
    const user = userEvent.setup();
    render(<CreateBattlePage />);
    await gotoContestants(user);

    await user.click(screen.getAllByRole("button", { name: /select a token/i })[0]);
    expect(await screen.findByText(/loading tokens/i)).toBeInTheDocument();
  });

  it("shows 'No tokens found' when a search matches nothing", async () => {
    const user = userEvent.setup();
    render(<CreateBattlePage />);
    await gotoContestants(user);

    await user.click(screen.getAllByRole("button", { name: /select a token/i })[0]);
    const dialogSearch = await screen.findByPlaceholderText(/search tokens/i);
    await user.type(dialogSearch, "zzz-no-match");

    expect(await screen.findByText(/no tokens found/i)).toBeInTheDocument();
  });
});
