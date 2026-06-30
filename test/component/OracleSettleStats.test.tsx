import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// OracleSettleStats fetches GET /api/oracle/settle-stats via axios. We mock
// axios so the spec is network-free and deterministic. The component is a
// "use client" admin panel; we assert loading, success (asofShare / byMethod /
// bySource rendering) and the error/empty paths.
// ---------------------------------------------------------------------------

vi.mock("axios", () => {
  const get = vi.fn();
  return { default: { get }, get };
});

import axios from "axios";
import OracleSettleStats from "@/components/admin/OracleSettleStats";

const mockedGet = axios.get as unknown as ReturnType<typeof vi.fn>;

const SUCCESS_STATS = {
  totalResolved: 8,
  byMethod: { asof: 6, "spot-fallback": 1, spot: 1, unrecorded: 0 },
  bySource: { "provider:pyth": 7, admin: 1 },
  asofShare: 0.75,
};

beforeEach(() => {
  mockedGet.mockReset();
});

describe("OracleSettleStats", () => {
  it("rejects an empty admin key without making a request", async () => {
    const user = userEvent.setup();
    render(<OracleSettleStats />);

    await user.click(screen.getByRole("button", { name: /load/i }));

    expect(
      screen.getByText(/enter the admin resolution key/i)
    ).toBeInTheDocument();
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("shows a loading spinner while the request is in flight, then disables it", async () => {
    const user = userEvent.setup();
    let resolveReq: (v: { data: typeof SUCCESS_STATS }) => void = () => {};
    mockedGet.mockReturnValue(
      new Promise((resolve) => {
        resolveReq = resolve;
      })
    );

    render(<OracleSettleStats />);
    await user.type(
      screen.getByPlaceholderText("ADMIN_RESOLUTION_KEY"),
      "secret-key"
    );
    const button = screen.getByRole("button", { name: /load/i });
    await user.click(button);

    // While pending the button is disabled (loading state).
    await waitFor(() => expect(button).toBeDisabled());

    resolveReq({ data: SUCCESS_STATS });
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("sends the admin key header and renders stats on success", async () => {
    const user = userEvent.setup();
    mockedGet.mockResolvedValue({ data: SUCCESS_STATS });

    render(<OracleSettleStats />);
    await user.type(
      screen.getByPlaceholderText("ADMIN_RESOLUTION_KEY"),
      "  secret-key  "
    );
    await user.click(screen.getByRole("button", { name: /load/i }));

    // Stats rendered.
    expect(await screen.findByText("8")).toBeInTheDocument(); // totalResolved
    // asofShare 0.75 -> 75%
    expect(screen.getByText("75%")).toBeInTheDocument();
    // by-method labels + counts
    expect(screen.getByText("As-of endTime (fair)")).toBeInTheDocument();
    expect(screen.getByText("Spot fallback")).toBeInTheDocument();
    // by-source rows
    expect(screen.getByText("provider:pyth")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();

    // The key is trimmed before being sent in the x-admin-key header.
    expect(mockedGet).toHaveBeenCalledTimes(1);
    const [, opts] = mockedGet.mock.calls[0];
    expect(opts).toMatchObject({ headers: { "x-admin-key": "secret-key" } });
  });

  it("renders '— (no data)' for as-of share when nothing has resolved", async () => {
    const user = userEvent.setup();
    mockedGet.mockResolvedValue({
      data: {
        totalResolved: 0,
        byMethod: { asof: 0, "spot-fallback": 0, spot: 0, unrecorded: 0 },
        bySource: {},
        asofShare: null,
      },
    });

    render(<OracleSettleStats />);
    await user.type(
      screen.getByPlaceholderText("ADMIN_RESOLUTION_KEY"),
      "secret-key"
    );
    await user.click(screen.getByRole("button", { name: /load/i }));

    expect(await screen.findByText(/no data/i)).toBeInTheDocument();
    expect(screen.getByText(/no resolved rounds yet/i)).toBeInTheDocument();
  });

  it("shows a 403 message when the admin key is rejected", async () => {
    const user = userEvent.setup();
    mockedGet.mockRejectedValue({ response: { status: 403 } });

    render(<OracleSettleStats />);
    await user.type(
      screen.getByPlaceholderText("ADMIN_RESOLUTION_KEY"),
      "bad-key"
    );
    await user.click(screen.getByRole("button", { name: /load/i }));

    expect(
      await screen.findByText(/invalid admin key \(403\)/i)
    ).toBeInTheDocument();
  });

  it("surfaces a server error message on the failure path", async () => {
    const user = userEvent.setup();
    mockedGet.mockRejectedValue({
      response: { status: 500, data: { error: "boom from server" } },
    });

    render(<OracleSettleStats />);
    await user.type(
      screen.getByPlaceholderText("ADMIN_RESOLUTION_KEY"),
      "secret-key"
    );
    await user.click(screen.getByRole("button", { name: /load/i }));

    expect(await screen.findByText("boom from server")).toBeInTheDocument();
  });
});
