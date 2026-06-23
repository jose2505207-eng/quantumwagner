//! Quantum Wager — minimal prediction-market escrow program (DEVNET ONLY).
//!
//! ⚠️ UNAUDITED. This is a teaching/demo scaffold for devnet. It must NOT be
//! deployed to mainnet without a professional security audit, an economic
//! review, and legal review. See ../../README.md and docs/SECURITY_NOTES.md.
//!
//! Flow:
//!   initialize_market -> place_bet (escrow SOL into a vault PDA) ->
//!   resolve_market (admin sets outcome) -> claim_winnings (pari-mutuel payout).
//! Events are emitted for off-chain indexing by the backend/frontend.

use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("Quantum1111111111111111111111111111111111111");

#[program]
pub mod quantum_wager {
    use super::*;

    /// Create a market with a binary YES/NO outcome and an end timestamp.
    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u64,
        end_ts: i64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.market_id = market_id;
        market.end_ts = end_ts;
        market.yes_pool = 0;
        market.no_pool = 0;
        market.resolved = false;
        market.outcome = Outcome::Pending;
        market.bump = ctx.bumps.market;
        market.vault_bump = ctx.bumps.vault;

        emit!(MarketInitialized { market_id, end_ts });
        Ok(())
    }

    /// Place a bet on YES or NO; lamports are escrowed into the market vault.
    pub fn place_bet(ctx: Context<PlaceBet>, side: Outcome, amount: u64) -> Result<()> {
        require!(amount > 0, WagerError::InvalidAmount);
        require!(!ctx.accounts.market.resolved, WagerError::MarketResolved);
        let now = Clock::get()?.unix_timestamp;
        require!(now < ctx.accounts.market.end_ts, WagerError::MarketEnded);
        require!(side != Outcome::Pending, WagerError::InvalidSide);

        // Transfer SOL from the bettor into the vault PDA.
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.bettor.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;

        let market = &mut ctx.accounts.market;
        match side {
            Outcome::Yes => market.yes_pool = market.yes_pool.checked_add(amount).unwrap(),
            Outcome::No => market.no_pool = market.no_pool.checked_add(amount).unwrap(),
            Outcome::Pending => return err!(WagerError::InvalidSide),
        }

        let position = &mut ctx.accounts.position;
        position.market = market.key();
        position.owner = ctx.accounts.bettor.key();
        position.side = side;
        position.amount = position.amount.checked_add(amount).unwrap();
        position.claimed = false;
        position.bump = ctx.bumps.position;

        emit!(BetPlaced {
            market_id: market.market_id,
            owner: position.owner,
            side,
            amount,
        });
        Ok(())
    }

    /// Resolve a market. Only the market authority (admin/oracle) may set the
    /// outcome, and only after the end timestamp. The outcome is never invented
    /// on-chain — it is provided by the trusted resolver.
    pub fn resolve_market(ctx: Context<ResolveMarket>, outcome: Outcome) -> Result<()> {
        require!(outcome != Outcome::Pending, WagerError::InvalidSide);
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, WagerError::MarketResolved);
        require_keys_eq!(
            market.authority,
            ctx.accounts.authority.key(),
            WagerError::Unauthorized
        );

        market.resolved = true;
        market.outcome = outcome;
        emit!(MarketResolved {
            market_id: market.market_id,
            outcome,
        });
        Ok(())
    }

    /// Claim winnings for a winning position (pari-mutuel: winners split the
    /// total pool pro-rata to their stake).
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let market = &ctx.accounts.market;
        require!(market.resolved, WagerError::MarketNotResolved);
        let position = &mut ctx.accounts.position;
        require!(!position.claimed, WagerError::AlreadyClaimed);
        require!(position.side == market.outcome, WagerError::NotAWinner);

        let winners_pool = match market.outcome {
            Outcome::Yes => market.yes_pool,
            Outcome::No => market.no_pool,
            Outcome::Pending => return err!(WagerError::MarketNotResolved),
        };
        require!(winners_pool > 0, WagerError::NotAWinner);

        let total_pool = market.yes_pool.checked_add(market.no_pool).unwrap();
        // payout = stake / winners_pool * total_pool
        let payout = (position.amount as u128)
            .checked_mul(total_pool as u128)
            .unwrap()
            .checked_div(winners_pool as u128)
            .unwrap() as u64;

        // Move lamports out of the vault PDA to the winner.
        let market_key = market.key();
        let seeds: &[&[u8]] = &[b"vault", market_key.as_ref(), &[market.vault_bump]];
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.owner.to_account_info(),
                },
                &[seeds],
            ),
            payout,
        )?;

        position.claimed = true;
        emit!(WinningsClaimed {
            market_id: market.market_id,
            owner: position.owner,
            payout,
        });
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = Market::SPACE,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,
    /// CHECK: system-owned PDA used purely as a lamport vault.
    #[account(
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,
    #[account(mut, seeds = [b"market", market.market_id.to_le_bytes().as_ref()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"vault", market.key().as_ref()], bump = market.vault_bump)]
    pub vault: SystemAccount<'info>,
    #[account(
        init_if_needed,
        payer = bettor,
        space = Position::SPACE,
        seeds = [b"position", market.key().as_ref(), bettor.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"market", market.market_id.to_le_bytes().as_ref()], bump = market.bump)]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(seeds = [b"market", market.market_id.to_le_bytes().as_ref()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"vault", market.key().as_ref()], bump = market.vault_bump)]
    pub vault: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"position", market.key().as_ref(), owner.key().as_ref()],
        bump = position.bump,
        constraint = position.owner == owner.key() @ WagerError::Unauthorized
    )]
    pub position: Account<'info, Position>,
    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub market_id: u64,
    pub end_ts: i64,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub resolved: bool,
    pub outcome: Outcome,
    pub bump: u8,
    pub vault_bump: u8,
}
impl Market {
    pub const SPACE: usize = 8 + 32 + 8 + 8 + 8 + 8 + 1 + 1 + 1 + 1;
}

#[account]
pub struct Position {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub side: Outcome,
    pub amount: u64,
    pub claimed: bool,
    pub bump: u8,
}
impl Position {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 8 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Outcome {
    Pending,
    Yes,
    No,
}

// ---------------------------------------------------------------------------
// Events & errors
// ---------------------------------------------------------------------------

#[event]
pub struct MarketInitialized {
    pub market_id: u64,
    pub end_ts: i64,
}
#[event]
pub struct BetPlaced {
    pub market_id: u64,
    pub owner: Pubkey,
    pub side: Outcome,
    pub amount: u64,
}
#[event]
pub struct MarketResolved {
    pub market_id: u64,
    pub outcome: Outcome,
}
#[event]
pub struct WinningsClaimed {
    pub market_id: u64,
    pub owner: Pubkey,
    pub payout: u64,
}

#[error_code]
pub enum WagerError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Invalid side")]
    InvalidSide,
    #[msg("Market already resolved")]
    MarketResolved,
    #[msg("Market has ended")]
    MarketEnded,
    #[msg("Market is not resolved yet")]
    MarketNotResolved,
    #[msg("Position already claimed")]
    AlreadyClaimed,
    #[msg("Not a winning position")]
    NotAWinner,
    #[msg("Unauthorized")]
    Unauthorized,
}
