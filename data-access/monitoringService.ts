"use server";

import { db } from "@/db";
import { testRuns } from "@/db/schema";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm";

export const getMonitoringData = async () => {
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
    latestRuns: runs.slice(0, 10), // Keep the latest 10 for detailed view
    successRate,
    totalRuns
  };
};
