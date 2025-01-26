"use client";

import { motion } from "framer-motion";
import { Users, Calendar, UserCheck, Target } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/DataTable/DataTable";
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
        ? 'bg-gray-800 border-primary/50' 
        : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70'
    } ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className={isActive ? 'text-primary' : 'text-primary/70'}>{icon}</div>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
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
  const [rows, setRows] = useState<any[]>([]);

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

  const getTableConfig = () => {
    if (!selectedStat) return null;

    if (selectedStat === "users") {
      return {
        headers: [
          { key: "email", label: "Email Address" },
          { key: "lastActive", label: "Last Active Date" },
          { key: "totalParticipation", label: "Total Rounds Participated" },
          { key: "totalSubmissions", label: "Total Submissions" },
          { key: "lastSignup", label: "Last Signup Date" },
          { key: "lastSubmitted", label: "Last Submission Date" },
        ],
        rows: (detailData as UserDetail[]).map(user => ({
          email: user.email,
          lastActive: user.lastActive ? formatDate(new Date(user.lastActive)) : "Never",
          totalParticipation: user.totalParticipation,
          totalSubmissions: user.totalSubmissions,
          lastSignup: user.lastSignup ? formatDate(new Date(user.lastSignup)) : "Never",
          lastSubmitted: user.lastSubmitted ? formatDate(new Date(user.lastSubmitted)) : "Never",
        })),
      };
    }

    return {
      headers: [
        { key: "roundId", label: "Round Number" },
        { key: "signupCount", label: "Total Signups" },
        { key: "submissionCount", label: "Total Submissions" },
        { key: "completionRate", label: "Completion Rate" },
      ],
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
          className="rounded-lg border border-gray-700/50 bg-gray-800/50 w-full"
        >
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold text-white">
              {selectedStat === "users" ? "User Details" : "Round Details"}
            </h2>
          </div>
          <div className="max-h-[400px] overflow-auto">
            <DataTable
              headers={tableConfig?.headers || []}
              rows={tableConfig?.rows || []}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
