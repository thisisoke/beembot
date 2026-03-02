# Sample Data Summary — Investment Chatbot Prototype

This directory contains realistic mock data derived from the adviceDirect QA environment HAR capture. It simulates what the advice engine API would return in production.

## API Endpoints & Data Objects

### 1. `UserProfileService/v1/user/profile` → `userProfile`
**What it returns:** The authenticated user's profile — name, login ID, language preference, last login, KYC status, feature flags, and account metadata.

| Key Field | Type | Notes |
|-----------|------|-------|
| `firstName` | string | User's first name |
| `applicationId` | `"IL_AD"` \| `"IL_SD"` | adviceDirect vs Self-Directed |
| `adPremium` | boolean | Premium tier (gets dedicated advisor team) |
| `totalTradeCount` | number | Lifetime trade count |
| `kycDueDateSR` | string | KYC renewal date |

### 2. `service/account` → `accounts`
**What it returns:** All accounts with holdings summary — positions, cash balances, gain/loss, and security details for each account.

| Key Field | Type | Notes |
|-----------|------|-------|
| `accountType` | enum | RRSP, TFSA, INDIVIDUAL, JOINT, RIF, RESP, CORPORATE, FHSA |
| `accountAttribute` | `"CASH"` \| `"MARGIN"` | Account margin type |
| `summary.marketValue` | number | Total investment market value (CAD) |
| `summary.buyingPower` | number | Available buying power |
| `securityDetails[]` | array | Each holding with symbol, quantity, avg cost, gain/loss, rating |
| `securityDetails[].investmentProduct.adRating` | object | Rating (0-100), sentiment signal, risk level |

### 3. `OptimizerService/v1/getInvestorProfile` → `investorProfile`
**What it returns:** The user's risk profile and target asset allocation limits.

| Key Field | Type | Notes |
|-----------|------|-------|
| `investorProfile` | `"AGG"` \| `"GRW"` \| `"BAL"` \| `"INC"` \| `"CON"` | Risk profile code |
| `suitabilityLimit.aaEQTargetPct` | number | Target equity allocation % |
| `suitabilityLimit.aaFITargetPct` | number | Target fixed income allocation % |
| `suitabilityLimit.riskLimitPct` | number | Max portfolio risk % |

### 4. `OptimizerService/v1/getBuyRecommendations` → `buyRecommendationsEQ` / `buyRecommendationsFI`
**What it returns:** Buy recommendations for equities (`?recommFilterType=EQ`) or fixed income/ETFs (`?recommFilterType=FI_ETF`).

| Key Field | Type | Notes |
|-----------|------|-------|
| `symbol` | string | Ticker symbol (e.g. TOU, ZAG) |
| `securityDesc` | string | Full company/fund name |
| `securityRating` | number | 0-100 MarketGrader rating |
| `sentiment` | `"POSITIVE"` \| `"NEUTRAL"` \| `"NEGATIVE"` | Analyst sentiment |
| `sectorDesc` | string | Sector name |
| `dividendYield` | number | Annual dividend yield % |
| `etfIndicator` | `"Y"` \| `"N"` | Whether it's an ETF |
| `merRatio` | number | Management Expense Ratio (ETFs only) |

### 5. `OptimizerService/v1/getSuitability` → `suitability`
**What it returns:** Portfolio suitability assessment — current vs target asset allocation, sell recommendations, and concentration warnings.

| Key Field | Type | Notes |
|-----------|------|-------|
| `assetAllocationList[]` | array | Current vs target for EQ, FI, CS with pass/under/over status |
| `sellRecomm[]` | array | Securities flagged for selling (low rating, concentration, etc.) |
| `concentrationDetailList[]` | array | Sector concentration warnings |
| `accountCashBalanceInCDN` | number | Total cash in CAD |

### 6. `OptimizerService/v1/getTradeIdeaCategories` → `tradeIdeaCategories`
**What it returns:** Categories of trade ideas (General, Fundamental, Income, Sentiment) with filterable sub-ideas like "Growth Stocks", "Cash Kings", "52 Week Highs".

### 7. `nudge-service/v1/getSOWNudgeOffers` → `nudgeOffers`
**What it returns:** Personalised advice nudges — contribution reminders, rebalancing suggestions, low-rated holding alerts, diversification warnings.

| Key Field | Type | Notes |
|-----------|------|-------|
| `offerID` | string | e.g. `RRSP_CONTRIBUTION_REMINDER`, `REBALANCE_EQUITY_OVERWEIGHT` |
| `status` | `"Live"` \| `"Presented"` \| `"Expired"` \| `"Accepted"` | Lifecycle state |
| `insight` | object | Title and body text for the insight message |
| `CTA` | object | Call-to-action title and body |

### 8. `quote-service/v1/indices` → `marketIndices` (shared)
**What it returns:** Real-time market index data — TSX, S&P 500, DJIA, NASDAQ, commodities, and FX rates.

---

## Sample Users

| # | Name | Age | Risk Profile | Portfolio (CAD) | Accounts | Life Stage |
|---|------|-----|-------------|-----------------|----------|------------|
| 1 | **Sarah Chen** | 35 | Growth (GRW) | $248,500 | TFSA + RRSP | Mid-career, building wealth |
| 2 | **Robert Tremblay** | 58 | Income (INC) | $847,200 | RRSP + Joint | Pre-retirement, income focus |
| 3 | **Aisha Patel** | 28 | Aggressive (AGG) | $74,850 | TFSA + FHSA | Early career, tech worker |
| 4 | **James Morrison** | 45 | Balanced (BAL) | $452,300 | RRSP + TFSA | Mid-career, balanced approach |

### Advice Scenarios per User

**Sarah Chen:**
- RRSP contribution deadline reminder (March 3 tax year cutoff)
- Portfolio rebalancing — equity slightly below 80% target

**Robert Tremblay:**
- Equity overweight alert — 48% vs 40% target (needs trimming before retirement)
- Low-rated holdings review — BCE (rating 42) and BNS (rating 55) flagged

**Aisha Patel:**
- TFSA contribution room available ($14,000 unused)
- Tech sector concentration warning — 60%+ in one sector

**James Morrison:**
- RRSP contribution deadline reminder ($22,000 room available)
- RESP setup suggestion — government matching for education savings

---

## File Structure

```
src/data/sample/
├── types.ts                    # TypeScript interfaces matching real API shapes
├── index.ts                    # Exports all users + shared data with helper functions
├── shared.json                 # Market indices, trade ideas, reference enums
├── user1-sarah-chen.json       # Growth investor, mid-career
├── user2-robert-tremblay.json  # Income investor, near-retirement
├── user3-aisha-patel.json      # Aggressive investor, early career
├── user4-james-morrison.json   # Balanced investor, mid-career
└── DATA-SUMMARY.md             # This file
```

## Usage in the Prototype

```typescript
import { sampleUsers, sharedData, getUserByName } from './data/sample';

// Get a specific user
const sarah = getUserByName('sarah');
const accounts = sarah.data.accounts.data.getAccountHoldingsSummary.accounts;
const riskProfile = sarah.data.investorProfile.investorProfile; // "GRW"

// Get their recommendations
const buyIdeas = sarah.data.buyRecommendationsEQ.buyRecommendations;
const advice = sarah.data.nudgeOffers.nudgeOffer;

// Market data
const indices = sharedData.marketIndices.marketWatchCategoryIndex;
```
