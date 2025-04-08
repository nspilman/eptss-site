import { DataTable, Header } from "@/components/DataTable";
import { UserDetail } from "@/providers";
import { formatDate } from "@/services/dateService";
import { motion } from "framer-motion";

// User Stats Component
type UserStatsProps = {
    detailData: UserDetail[];
    isLoading: boolean;
    sortKey: string | null;
    sortDirection: "asc" | "desc" | null;
    onSort: (key: string, direction: "asc" | "desc" | null) => void;
  };
  
export const UserStatsComponent = ({ detailData, isLoading, sortKey, sortDirection, onSort }: UserStatsProps) => {
    const headers = [
      { key: "email", label: "Email Address", sortable: true, type: 'text' } as Header<string>,
      { key: "lastActive-sort", label: "Last Active Date", sortable: true, type: 'date', displayKey: "lastActive" } as Header<string>,
      { key: "totalParticipation", label: "Total Rounds Participated", sortable: true, type: 'number' } as Header<string>,
      { key: "totalSubmissions", label: "Total Submissions", sortable: true, type: 'number' } as Header<string>,
      { key: "lastSignup-sort", label: "Last Signup Date", sortable: true, type: 'date', displayKey: "lastSignup" } as Header<string>,
      { key: "lastSubmitted-sort", label: "Last Submission Date", sortable: true, type: 'date', displayKey: "lastSubmitted" } as Header<string>,
    ] as const;
  
    const rows = detailData.map(user => {
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
    });
  
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border border-background-tertiary/50 bg-background-secondary/50 w-full"
      >
        <div className="p-4 border-b border-background-tertiary/50">
          <h2 className="text-lg font-semibold text-primary">User Details</h2>
        </div>
        <div className="max-h-[400px] overflow-auto">
          <DataTable
            headers={headers}
            rows={rows}
            isLoading={isLoading}
            defaultSortKey={sortKey || undefined}
            defaultSortDirection={sortDirection}
            onSort={onSort}
          />
        </div>
      </motion.div>
    );
  };