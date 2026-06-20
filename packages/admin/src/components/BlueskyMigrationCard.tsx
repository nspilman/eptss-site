"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DataTable, Header, Card, CardHeader, CardTitle, CardContent } from "@eptss/ui";
// The data shape has exactly one home — the producer (getMigrationStatus). Consume
// it; never re-declare it, or the two drift the moment a field is added.
import type { MigrationStatus } from "../providers";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background-secondary/30 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-secondary">{label}</div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {sub ? <div className="text-xs text-secondary">{sub}</div> : null}
    </div>
  );
}

export function BlueskyMigrationCard({ data }: { data: MigrationStatus }) {
  const { summary, linkedUsers, unlinkedUsers } = data;

  // Linked table: surface whoever still has covers on admin (sort by it, desc).
  const [linkedSortKey, setLinkedSortKey] = useState<string>("onAdmin");
  const [linkedSortDir, setLinkedSortDir] = useState<"asc" | "desc" | null>("desc");
  // Unlinked table: highest-value outreach first (most covers waiting).
  const [unlinkedSortKey, setUnlinkedSortKey] = useState<string>("covers");
  const [unlinkedSortDir, setUnlinkedSortDir] = useState<"asc" | "desc" | null>("desc");

  const linkedHeaders = [
    { key: "handle", label: "Atmosphere", sortable: true, type: "text" } as Header<string>,
    { key: "email", label: "Email", sortable: true, type: "text" } as Header<string>,
    { key: "claimed", label: "Claimed", sortable: true, type: "number" } as Header<string>,
    { key: "onAdmin", label: "On admin", sortable: true, type: "number" } as Header<string>,
    { key: "status", label: "Status", sortable: true, type: "text" } as Header<string>,
    { key: "did", label: "DID", sortable: false, type: "text" } as Header<string>,
  ] as const;

  const linkedRows = linkedUsers.map((u) => ({
    handle: u.handle ? `@${u.handle}` : "—",
    email: u.email,
    claimed: u.claimedSubmissions,
    onAdmin: u.totalSubmissions - u.claimedSubmissions,
    status: u.fullyMigrated
      ? "✓ Migrated"
      : u.claimedSubmissions > 0
        ? "◐ Partial"
        : "○ Pending",
    did: u.did ?? "—",
  }));

  const unlinkedHeaders = [
    { key: "email", label: "Email", sortable: true, type: "text" } as Header<string>,
    { key: "username", label: "Username", sortable: true, type: "text" } as Header<string>,
    { key: "covers", label: "Covers on admin", sortable: true, type: "number" } as Header<string>,
  ] as const;

  const unlinkedRows = unlinkedUsers.map((u) => ({
    email: u.email,
    username: u.username ?? "—",
    covers: u.totalSubmissions - u.claimedSubmissions,
  }));

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Bluesky Migration</CardTitle>
            <p className="text-sm text-secondary">
              Who has linked an Atmosphere identity, and whether their covers have moved to that DID
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Stat
                label="Linked"
                value={`${summary.linked} / ${summary.participants}`}
                sub="participants"
              />
              <Stat label="Fully migrated" value={`${summary.fullyMigrated}`} sub="all covers claimed" />
              <Stat
                label="Covers claimed"
                value={`${summary.claimedSubmissions} / ${summary.totalSubmissions}`}
                sub="across everyone"
              />
              <Stat
                label="Covers on admin"
                value={`${summary.coversOnAdmin}`}
                sub={`${summary.coversOnAdminLinked} claimable · ${summary.coversOnAdminUnlinked} need link`}
              />
              <Stat label="Not linked yet" value={`${unlinkedUsers.length}`} sub="must link to migrate" />
            </div>

            {/* Linked members — the tracked set */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-primary">Linked members</h3>
              {linkedUsers.length > 0 ? (
                <DataTable
                  headers={linkedHeaders}
                  rows={linkedRows}
                  isLoading={false}
                  defaultSortKey={linkedSortKey}
                  defaultSortDirection={linkedSortDir}
                  onSort={(k, d) => {
                    setLinkedSortKey(k);
                    setLinkedSortDir(d);
                  }}
                  maxHeight={400}
                  allowCopy={true}
                />
              ) : (
                <p className="text-sm text-secondary">No users have linked a Bluesky account yet.</p>
              )}
            </div>

            {/* Not yet linked — the outreach list */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-primary">
                Not yet linked{" "}
                <span className="font-normal text-secondary">
                  — these covers can&apos;t migrate until the member links bsky
                </span>
              </h3>
              {unlinkedUsers.length > 0 ? (
                <DataTable
                  headers={unlinkedHeaders}
                  rows={unlinkedRows}
                  isLoading={false}
                  defaultSortKey={unlinkedSortKey}
                  defaultSortDirection={unlinkedSortDir}
                  onSort={(k, d) => {
                    setUnlinkedSortKey(k);
                    setUnlinkedSortDir(d);
                  }}
                  maxHeight={400}
                  allowCopy={true}
                />
              ) : (
                <p className="text-sm text-secondary">Everyone with covers has linked. 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
