"use client";

import { useEffect, useState } from "react";
import {
  adminGetAllReferralCodes,
  adminGetAllUserReferrals,
  adminGetSystemReferralStats,
} from "@eptss/actions";
import { Card, CardContent } from "@eptss/ui";

type ReferralCode = {
  id: string;
  code: string;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  createdByUserId: string;
  creatorEmail: string | null;
  creatorUsername: string | null;
  creatorDisplayName: string | null;
};

type UserReferral = {
  id: string;
  referredUserId: string;
  referrerUserId: string;
  referralCodeId: string;
  createdAt: Date;
  referredUserEmail: string;
  referredUsername: string;
  referredDisplayName: string | null;
  referrerEmail: string;
  referrerUsername: string;
  referrerDisplayName: string | null;
  code: string;
};

type Stats = {
  totalCodes: number;
  activeCodes: number;
  totalReferrals: number;
  totalUsersWithCodes: number;
};

export function ReferralsTab() {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [userReferrals, setUserReferrals] = useState<UserReferral[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCodes: 0,
    activeCodes: 0,
    totalReferrals: 0,
    totalUsersWithCodes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"referrals" | "codes">("referrals");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [codesResult, referralsResult, statsResult] = await Promise.all([
          adminGetAllReferralCodes(),
          adminGetAllUserReferrals(),
          adminGetSystemReferralStats(),
        ]);

        if (codesResult.success) {
          setReferralCodes(codesResult.codes as ReferralCode[]);
        }
        if (referralsResult.success) {
          setUserReferrals(referralsResult.referrals as UserReferral[]);
        }
        if (statsResult.success) {
          setStats(statsResult.stats);
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredReferrals = userReferrals.filter((referral) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      referral.referredUserEmail.toLowerCase().includes(search) ||
      referral.referredUsername.toLowerCase().includes(search) ||
      referral.referrerEmail.toLowerCase().includes(search) ||
      referral.referrerUsername.toLowerCase().includes(search) ||
      referral.code.toLowerCase().includes(search)
    );
  });

  const filteredCodes = referralCodes.filter((code) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      code.code.toLowerCase().includes(search) ||
      code.creatorEmail?.toLowerCase().includes(search) ||
      code.creatorUsername?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-primary">Loading referral data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.totalReferrals}</div>
            <div className="text-sm text-secondary">Total Referrals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.totalCodes}</div>
            <div className="text-sm text-secondary">Total Codes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.activeCodes}</div>
            <div className="text-sm text-secondary">Active Codes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.totalUsersWithCodes}</div>
            <div className="text-sm text-secondary">Users with Codes</div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView("referrals")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === "referrals"
                ? "bg-primary text-background"
                : "bg-background-secondary text-secondary hover:bg-background-tertiary"
            }`}
          >
            User Referrals ({userReferrals.length})
          </button>
          <button
            onClick={() => setActiveView("codes")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === "codes"
                ? "bg-primary text-background"
                : "bg-background-secondary text-secondary hover:bg-background-tertiary"
            }`}
          >
            Referral Codes ({referralCodes.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-background-secondary border border-background-tertiary rounded-md text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* User Referrals View */}
      {activeView === "referrals" && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-background-tertiary">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                      Referred User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                      Referred By
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                      Referral Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                      Join Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-secondary">
                        {searchTerm ? "No referrals match your search" : "No referrals found"}
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((referral) => (
                      <tr
                        key={referral.id}
                        className="border-b border-background-tertiary/50 hover:bg-background-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-primary font-medium">
                              {referral.referredDisplayName || referral.referredUsername}
                            </div>
                            <div className="text-xs text-secondary">{referral.referredUserEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-primary font-medium">
                              {referral.referrerDisplayName || referral.referrerUsername}
                            </div>
                            <div className="text-xs text-secondary">{referral.referrerEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="px-2 py-1 bg-background-tertiary rounded text-sm text-primary">
                            {referral.code}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-secondary">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Codes View */}
      {activeView === "codes" && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-background-tertiary">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                      Created By
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                      Usage
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-secondary">
                        {searchTerm ? "No codes match your search" : "No referral codes found"}
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((code) => (
                      <tr
                        key={code.id}
                        className="border-b border-background-tertiary/50 hover:bg-background-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <code className="px-2 py-1 bg-background-tertiary rounded text-sm text-primary">
                            {code.code}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-primary font-medium">
                              {code.creatorDisplayName || code.creatorUsername}
                            </div>
                            <div className="text-xs text-secondary">{code.creatorEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-primary">
                            {code.usesCount}
                            {code.maxUses !== null && ` / ${code.maxUses}`}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              code.isActive
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {code.isActive ? "Active" : "Inactive"}
                          </span>
                          {code.expiresAt && (
                            <div className="text-xs text-secondary mt-1">
                              Expires: {new Date(code.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-secondary">
                          {new Date(code.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
