/**
 * Type definitions matching the real advice engine API response shapes.
 * Derived from HAR capture of investorlineqa02.bmofg.com endpoints.
 */

// ─── User Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  firstName: string;
  loginId: string;
  encryptedClientId: string;
  applicationId: "IL_AD" | "IL_SD";
  language: "en-CA" | "fr-CA";
  lastLoginDateTime: string;
  sessionInactiveTimeout: number;
  optedFlag: boolean;
  adPremium: boolean;
  st: string;
  pilotUser: boolean;
  ownerInd: boolean;
  ownerJoint: boolean;
  totalTradeCount: number;
  kycDueDateSR: string;
  appcues: {
    clientCreatedDate: string;
    adFundedAccountFlag: "TRUE" | "FALSE";
    sdFundedAccountFlag: "TRUE" | "FALSE";
    offeringCodeFlag: string;
    tradeFlag: "TRUE" | "FALSE";
  };
}

export interface UserProfileResponse {
  userProfile: UserProfile;
}

// ─── Account Holdings ───────────────────────────────────────────────────────

export interface SecurityDetail {
  tickerSymbol: string;
  symbol: string;
  securityDescription: string;
  securityTypeDesc: string;
  securityFund: "CAD" | "USD";
  assetClassCode: "E" | "F" | "C"; // Equity, Fixed Income, Cash
  quantity: number;
  averageCost: number;
  settlementFund: "CAD" | "USD";
  gainLossInCAD: number;
  gainLossPercentageInCAD: number;
  marketValueInCAD: number;
  currencyIndicator: "CAD" | "USD";
  holdingFund: "CAD" | "USD";
  country: string | null;
  cusip: string | null;
  valid: boolean;
  delisted: boolean;
  exchange: {
    country: string | null;
    code: string;
  };
  investmentProduct: {
    tradeable: boolean;
    type: "E" | "F" | "C";
    etf: boolean | null;
    securityType: string;
    adRating: {
      rating: number;
      mgdSntmntSgnl: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
      risk: "L" | "M" | "H";
    } | null;
  } | null;
}

export interface CashDetail {
  currency: "CAD" | "USD";
  cashValue: number;
}

export interface AccountSummary {
  tradingDayCashValue: number;
  buyingPower: number;
  marketValue: number;
  accountBalance: number;
  realTimeCashDeposit: number;
}

export interface Account {
  accountId: string;
  accountNumber: string;
  encryptedAccountNumber: string;
  tradingAgent: boolean;
  accountType:
    | "INDIVIDUAL"
    | "JOINT"
    | "RRSP"
    | "TFSA"
    | "RIF"
    | "RESP"
    | "CORPORATE"
    | "FHSA"
    | "PERSONAL_HOLDING_COMPANY";
  accountNickName: string;
  accountStatusCode: "ACTIVE" | "INACTIVE";
  accountOpenDate: string | null;
  primary: boolean;
  selected: boolean;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  investmentGainLoss: number;
  investmentGainLossPercentage: number;
  dailyGainLoss: number;
  dailyGainLossPercentage: number;
  serviceOfferingType: "IL_AD" | "IL_SD";
  accountAttribute: "MARGIN" | "CASH";
  optionTrdElgFlag: boolean;
  summary: AccountSummary | null;
  securityDetails: SecurityDetail[] | null;
  cashDetails: CashDetail[] | null;
  investmentTotalMarketValue: number;
}

export interface AccountHoldingsSummary {
  asOfDate: string;
  baseFund: "CAD";
  usExchangeRate: number;
  accounts: Account[];
}

export interface AccountResponse {
  data: {
    getAccountHoldingsSummary: AccountHoldingsSummary;
  };
}

// ─── Investor Profile (Risk) ────────────────────────────────────────────────

export interface SuitabilityLimit {
  aaEQTargetPct: number;
  aaEQVarPct: number;
  aaFITargetPct: number;
  aaFIVarPct: number;
  aaCSTargetPct: number;
  aaCSVarPct: number;
  riskLimitPct: number;
  riskVarPct: number;
  concEQLimitPct: number;
  concFILimitPct: number;
}

export interface InvestorProfileResponse {
  /** GRW=Growth, BAL=Balanced, INC=Income, AGG=Aggressive, CON=Conservative */
  investorProfile: "GRW" | "BAL" | "INC" | "AGG" | "CON";
  messages: string[];
  profileType: "STD" | "PREM";
  suitabilityLimit: SuitabilityLimit;
  teamId: string;
}

// ─── Buy Recommendations ────────────────────────────────────────────────────

export interface BuyRecommendation {
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  assetClass: "EQ" | "FI";
  buyOrSell: "B";
  canadianPrice: number;
  country: "C" | "U";
  currencyFormat: "cad" | "usd";
  cusip: string;
  dividendYield: number;
  etfIndicator: "Y" | "N";
  gicsCode: string;
  mktCapital: "LCAP" | "MCAP" | "SCAP" | string;
  symbol: string;
  securityDesc: string;
  sectorDesc: string;
  securityRating: number;
  securityType: string;
  recommendationDate: string;
  recommendedDate: string;
  tradeAsCode: "EQ" | "FI";
  avgTenDayVolume?: number;
  sntmRatingNumber?: number;
  /** ETF-specific fields */
  fundType?: "fixedIncome" | "equity";
  merRatio?: number;
  totalYieldSemiAnnual?: number;
}

export interface BuyRecommendationsResponse {
  buyRecommendations: BuyRecommendation[];
}

// ─── Suitability / Asset Allocation ─────────────────────────────────────────

export interface SubAssetAllocation {
  assetClass: string;
  currentValueAmt: number;
  currentValuePct: number;
  subAssetClass: string;
}

export interface AssetAllocation {
  assetClass: "EQ" | "FI" | "CS";
  currentValueAmt: number;
  currentValuePct: number;
  status: "P" | "U" | "O"; // Pass, Under, Over
  targetValueAmt: number;
  targetValuePct: number;
  variancePct: number;
  subAssetAllocationList: SubAssetAllocation[];
}

export interface RecommendationReason {
  createDate: string;
  reasonCode: "PR" | "AA" | "CO" | "RT";
  suitabilityType: "RTNG" | "AAST" | "CONC" | "RISK";
}

export interface SellRecommendation {
  accountFund: string;
  assetClass: "EQ" | "FI";
  buyOrSell: "S";
  canadianPrice: number;
  country: "C" | "U";
  currencyFormat: "cad" | "usd";
  symbol: string;
  securityDesc: string;
  sectorDesc: string;
  securityRating: number;
  holdingInd: "Y" | "N";
  planQuantity: number;
  recommendedQuantity: number;
  recommendationType: "F" | "P";
  recommendationReasons: RecommendationReason[];
  priceInSecurityFund: number;
  avgCostInSecurityFund: number;
}

export interface ConcentrationDetail {
  curConcAcctPct: number;
  curConcValueAmt: number;
  optConcStat: "P" | "U" | "O";
  optGroupCode: string;
  sectorInd: "Y" | "N";
}

export interface SuitabilityResponse {
  accountCashBalanceInCDN: number;
  availableCashCDN: number;
  assetAllocationList: AssetAllocation[];
  buyRecomm: BuyRecommendation[];
  sellRecomm: SellRecommendation[];
  concentrationDetailList: ConcentrationDetail[];
  emptyHoldings: boolean;
  messages: string[];
}

// ─── Trade Ideas ─────────────────────────────────────────────────────────────

export interface TradeIdea {
  tradeIdeaCode: string;
  tradeIdeaName: string;
}

export interface TradeIdeaCategory {
  tradeIdeaCategoryId: string;
  tradeIdeaCategoryName: string;
  tradeIdeas: TradeIdea[];
}

export interface TradeIdeaCategoriesResponse {
  tradeIdeaCategories: TradeIdeaCategory[];
}

export interface TradeIdeaStock {
  symbol: string;
  securityDesc: string;
  country: "C" | "U";
  cusip: string;
  rating: number;
  marketPrice: number;
  dividendYield: number;
  mktCapNum: number;
  overAllGrowth: number;
  overAllValue: number;
  cashFlowGrade: string;
  sentimentSgnl: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  sentimentRtng: number;
  sectorCode: string;
  tradeAsCode: "EQ";
}

export interface TradeIdeaStocksResponse {
  stocks: TradeIdeaStock[];
}

// ─── Nudge / Advice Offers ──────────────────────────────────────────────────

export interface NudgeAction {
  date: string;
  action: "Created" | "Presented" | "Accepted" | "Expired";
  placement: string;
}

export interface NudgeInsight {
  insightMsgTitle: string;
  insightMsgBody: string;
  newPct: number;
  timeKey: string;
}

export interface NudgeOffer {
  clientId: string;
  modelID: string;
  offerID: string;
  startDate: string;
  endDate: string;
  status: "Live" | "Presented" | "Expired" | "Accepted";
  actions: NudgeAction[];
  insight: NudgeInsight;
  valueProp: { title: string; body: string };
  AD: { title: string; body: string };
  CTA: { title: string; body: string };
}

export interface NudgeOffersResponse {
  sowOffer: Record<string, unknown>;
  nudgeOffer: NudgeOffer[];
}

// ─── Market Indices ─────────────────────────────────────────────────────────

export interface MarketIndex {
  indexName: string;
  symbol: string;
  id: string;
  marketPrice: number;
  change: number;
  percentageChange: number;
  currencyIndicator: "CAD" | "USD";
  name: string;
}

export interface MarketIndexCategory {
  categoryName: string;
  marketWatchIndices: MarketIndex[];
}

export interface MarketIndicesResponse {
  marketWatchCategoryIndex: MarketIndexCategory[];
}

// ─── Advisor Team ───────────────────────────────────────────────────────────

export interface Advisor {
  FIRST_NAME: string;
  LAST_NAME: string;
  DESCRIPTION: string;
}

export interface AdvisorTeam {
  TEAMID: string;
  TYPE: "PREMIUM" | "STANDARD";
  CALL_YOUR_ADVISOR: string;
  EMAIL: string;
  ADVISORS: Advisor[];
}

// ─── Combined Mock User Data ────────────────────────────────────────────────

export interface MockUser {
  userProfile: UserProfileResponse;
  accounts: AccountResponse;
  investorProfile: InvestorProfileResponse;
  suitability: SuitabilityResponse;
  buyRecommendationsEQ: BuyRecommendationsResponse;
  buyRecommendationsFI: BuyRecommendationsResponse;
  nudgeOffers: NudgeOffersResponse;
  advisorTeam: AdvisorTeam;
}
