"use client";

import { motion } from "framer-motion";
import { Users, Calendar, UserCheck, Target } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import type { Header } from "@/components/DataTable/DataTable";
import { UserDetail, RoundDetail, getUserDetails, getRoundDetails } from "@/providers/adminProvider/adminProvider";
import { formatDate } from "@/services/dateService";

type StatItemProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};

const StatItem = ({ title, value, icon, isActive, onClick }: StatItemProps) => (
  <div 
    className={`p-4 rounded-lg border transition-colors ${
      isActive 
        ? 'bg-background-secondary border-accent-primary/50' 
        : 'bg-background-secondary/50 border-background-tertiary/50 hover:bg-background-secondary/70'
    } ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-secondary">{title}</h3>
      <div className={isActive ? 'text-accent-primary' : 'text-accent-primary/70'}>{icon}</div>
    </div>
    <p className="text-2xl font-bold text-primary">{value}</p>
  </div>
);

type ProjectStatsCardProps = {
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
}: ProjectStatsCardProps) {
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

  const getTableConfig = () => {
    if (!selectedStat) return null;

    if (selectedStat === "users") {
      return {
        headers: [
          { key: "email", label: "Email Address", sortable: true, type: 'text' } as Header<string>,
          { key: "lastActive-sort", label: "Last Active Date", sortable: true, type: 'date', displayKey: "lastActive" } as Header<string>,
          { key: "totalParticipation", label: "Total Rounds Participated", sortable: true, type: 'number' } as Header<string>,
          { key: "totalSubmissions", label: "Total Submissions", sortable: true, type: 'number' } as Header<string>,
          { key: "lastSignup-sort", label: "Last Signup Date", sortable: true, type: 'date', displayKey: "lastSignup" } as Header<string>,
          { key: "lastSubmitted-sort", label: "Last Submission Date", sortable: true, type: 'date', displayKey: "lastSubmitted" } as Header<string>,
        ] as const,
        rows: (detailData as UserDetail[]).map(user => {
          // Store original date values as ISO strings for proper sorting
          const lastActiveDate = user.lastActive ? new Date(user.lastActive).toISOString() : null;
          const lastSignupDate = user.lastSignup ? new Date(user.lastSignup).toISOString() : null;
          const lastSubmittedDate = user.lastSubmitted ? new Date(user.lastSubmitted).toISOString() : null;
          
          return {
            email: user.email,
            // For display, use the formatted date
            lastActive: user.lastActive ? formatDate.full(new Date(user.lastActive)) : "Never",
            // Store the original date value as a data attribute for sorting
            "lastActive-sort": lastActiveDate || "9999-12-31T23:59:59.999Z", // Use far future date for "Never"
            totalParticipation: user.totalParticipation,
            totalSubmissions: user.totalSubmissions,
            lastSignup: user.lastSignup ? formatDate.full(new Date(user.lastSignup)) : "Never",
            "lastSignup-sort": lastSignupDate || "9999-12-31T23:59:59.999Z",
            lastSubmitted: user.lastSubmitted ? formatDate.full(new Date(user.lastSubmitted)) : "Never",
            "lastSubmitted-sort": lastSubmittedDate || "9999-12-31T23:59:59.999Z",
          };
        }),
      };
    }

    return {
      headers: [
        { key: "roundId", label: "Round Number", sortable: true, type: 'number' } as Header<string>,
        { key: "signupCount", label: "Total Signups", sortable: true, type: 'number' } as Header<string>,
        { key: "submissionCount", label: "Total Submissions", sortable: true, type: 'number' } as Header<string>,
        { key: "completionRate", label: "Completion Rate", sortable: true, type: 'number' } as Header<string>,
      ] as const,
      rows: (detailData as RoundDetail[]).map(round => ({
        roundId: round.roundId,
        signupCount: round.signupCount,
        submissionCount: round.submissionCount,
        completionRate: `${Math.round(round.completionRate * 100)}%`,
      })),
    };
  };

  const tableConfig = getTableConfig();

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

      {(tableConfig || isLoading) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border border-background-tertiary/50 bg-background-secondary/50 w-full"
        >
          <div className="p-4 border-b border-background-tertiary/50">
            <h2 className="text-lg font-semibold text-primary">
              {selectedStat === "users" ? "User Details" : "Round Details"}
            </h2>
          </div>
          <div className="max-h-[400px] overflow-auto">
            <DataTable
              headers={tableConfig?.headers || []}
              rows={tableConfig?.rows || []}
              isLoading={isLoading}
              defaultSortKey={sortKey || undefined}
              defaultSortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
