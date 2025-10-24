"use server";

import { db } from "../db";
import { testRuns } from "../db/schema";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm";

export async function saveTestRun(testData: {
  testName: string;
  status: string;
  errorMessage?: string | null;
  duration?: number;
  environment: string;
  startedAt: Date;
}) {
  const result = await db.insert(testRuns).values(testData).returning();
  return result[0];
}

export async function getMonitoringData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all runs from the last 30 days
  const runs = await db
    .select()
    .from(testRuns)
    .where(sql`${testRuns.startedAt} >= ${thirtyDaysAgo.toISOString()}`)
    .orderBy(desc(testRuns.startedAt));

  // Get stats for the last 24 hours for the summary
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const dailyStats = await db
    .select({
      totalRuns: sql<number>`count(*)`,
      passedRuns: sql<number>`sum(case when ${testRuns.status} = 'success' then 1 else 0 end)`
    })
    .from(testRuns)
    .where(sql`${testRuns.startedAt} >= ${twentyFourHoursAgo.toISOString()}`);

  const { totalRuns, passedRuns } = dailyStats[0];
  const successRate = totalRuns > 0 ? (passedRuns / totalRuns) * 100 : 100;

  return {
    runs,
    latestRuns: runs.slice(0, 5),
    successRate,
    totalRuns
  };
}
