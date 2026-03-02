/**
 * Sample data for the investment chatbot prototype.
 *
 * Generated from real API response shapes captured via HAR from the
 * adviceDirect QA environment. All user data is fictional.
 *
 * Usage:
 *   import { sampleUsers, sharedData, getUserById } from './data/sample';
 *
 *   const sarah = getUserById('user-001');
 *   const indices = sharedData.marketIndices;
 */

import type { MockUser } from "./types";

import user1 from "./user1-sarah-chen.json";
import user2 from "./user2-robert-tremblay.json";
import user3 from "./user3-aisha-patel.json";
import user4 from "./user4-james-morrison.json";
import shared from "./shared.json";

export type { MockUser } from "./types";
export * from "./types";

// ─── User data keyed by userId ──────────────────────────────────────────────

export interface SampleUser {
  meta: {
    userId: string;
    persona: string;
    age: number;
    lifeStage: string;
    riskTolerance: string;
    totalPortfolioCAD: number;
  };
  data: MockUser;
}

function toSampleUser(raw: Record<string, unknown>): SampleUser {
  const meta = raw._meta as SampleUser["meta"];
  const { _meta, ...data } = raw;
  return { meta, data: data as unknown as MockUser };
}

export const sampleUsers: SampleUser[] = [
  toSampleUser(user1 as Record<string, unknown>),
  toSampleUser(user2 as Record<string, unknown>),
  toSampleUser(user3 as Record<string, unknown>),
  toSampleUser(user4 as Record<string, unknown>),
];

/** Look up a sample user by their userId (e.g. "user-001"). */
export function getUserById(userId: string): SampleUser | undefined {
  return sampleUsers.find((u) => u.meta.userId === userId);
}

/** Look up a sample user by first name (case-insensitive). */
export function getUserByName(name: string): SampleUser | undefined {
  const lower = name.toLowerCase();
  return sampleUsers.find((u) => {
    const firstName =
      u.data.userProfile.userProfile.firstName.toLowerCase();
    return firstName === lower || firstName.startsWith(lower);
  });
}

// ─── Shared / reference data ────────────────────────────────────────────────

export const sharedData = shared;
