"use server";

import { db } from "@/db";
import { testRuns } from "@/db/schema";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm";

export const getMonitoringData = async () => {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  // First get the latest runs
  const latestRuns = await db
    .select()
    .from(testRuns)
    .where(sql`${testRuns.startedAt} >= ${twentyFourHoursAgo.toISOString()}`)
    .orderBy(desc(testRuns.startedAt))
    .limit(10);

  // Then get the stats
  const stats = await db
    .select({
      totalRuns: sql<number>`count(*)`,
      passedRuns: sql<number>`sum(case when ${testRuns.status} = 'passed' then 1 else 0 end)`
    })
    .from(testRuns)
    .where(sql`${testRuns.startedAt} >= ${twentyFourHoursAgo.toISOString()}`);

  const { totalRuns, passedRuns } = stats[0];
  
  return {
    latestRuns,
    successRate: totalRuns ? (passedRuns / totalRuns) * 100 : 100,
    totalRuns: totalRuns || 0
  };
};
