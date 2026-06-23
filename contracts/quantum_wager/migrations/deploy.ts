// Anchor deploy migration (devnet). Runs on `anchor migrate`.
import * as anchor from "@coral-xyz/anchor";

module.exports = async function (provider: anchor.AnchorProvider) {
  anchor.setProvider(provider);
  console.log("Deployed quantum_wager to:", provider.connection.rpcEndpoint);
  // Add any post-deploy bootstrapping here (e.g. seeding a demo market).
};
