"use client";

import { motion } from "framer-motion";
import { Users, Calendar, UserCheck, Target } from "lucide-react";
import { useState } from "react";
import { UserDetail, RoundDetail, getUserDetails, getRoundDetails } from "@/providers/adminProvider/adminProvider";
import { RoundStatsComponent } from "./RoundStatsComponent";
import { StatItem } from "./StatItem";
import { UserStatsComponent } from "./UserStatsCard";

type Props = {
  totalUsers: number;
  totalRounds: number;
  activeUsers: number;
  completionRate: number;
};

export function ProjectStatsCard({
  totalUsers,
  totalRounds,
  activeUsers,
  completionRate,
}: Props) {
  const [selectedStat, setSelectedStat] = useState<"users" | "rounds" | null>(null);
  const [detailData, setDetailData] = useState<UserDetail[] | RoundDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const handleStatClick = async (type: "users" | "rounds") => {
    if (selectedStat === type) {
      setSelectedStat(null);
      setDetailData([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = type === "users" 
        ? await getUserDetails()
        : await getRoundDetails();
        
      setDetailData(data);
      setSelectedStat(type);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: string, direction: "asc" | "desc" | null) => {
    setSortKey(key);
    setSortDirection(direction);
  };

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatItem
          title="Total Users"
          value={totalUsers}
          icon={<Users className="h-4 w-4" />}
          isActive={selectedStat === "users"}
          onClick={() => handleStatClick("users")}
        />
        <StatItem
          title="Total Rounds"
          value={totalRounds}
          icon={<Calendar className="h-4 w-4" />}
          isActive={selectedStat === "rounds"}
          onClick={() => handleStatClick("rounds")}
        />
        <StatItem
          title="Active Users"
          value={activeUsers}
          icon={<UserCheck className="h-4 w-4" />}
        />
        <StatItem
          title="Completion Rate"
          value={`${Math.round(completionRate * 100)}%`}
          icon={<Target className="h-4 w-4" />}
        />
      </motion.div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border border-background-tertiary/50 bg-background-secondary/50 w-full p-8 flex justify-center"
        >
          <p className="text-secondary">Loading...</p>
        </motion.div>
      )}

      {!isLoading && selectedStat === "users" && (
        <UserStatsComponent 
          detailData={detailData as UserDetail[]}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}

      {!isLoading && selectedStat === "rounds" && (
        <RoundStatsComponent 
          detailData={detailData as RoundDetail[]}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
