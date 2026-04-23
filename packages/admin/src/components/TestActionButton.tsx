"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@eptss/ui";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Message = { type: "success" | "error" | "info"; text: string };

export type TestActionButtonProps = {
  endpoint: string;
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  loadingLabel?: string;
  useCronAuth?: boolean;
  getResult: (data: any) => Message;
  renderDetails?: (data: any) => ReactNode;
};

export function TestActionButton({
  endpoint,
  icon,
  title,
  description,
  buttonLabel,
  loadingLabel = "Testing...",
  useCronAuth = true,
  getResult,
  renderDetails,
}: TestActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [details, setDetails] = useState<any>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setMessage(null);
    setDetails(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (useCronAuth) {
        headers.Authorization = `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}`;
      }

      const response = await fetch(endpoint, { method: "POST", headers });
      const data = await response.json();

      if (response.ok) {
        setMessage(getResult(data));
        setDetails(data);
      } else {
        setMessage({
          type: "error",
          text: data.error || data.message || "Failed to test endpoint",
        });
        if (data.error || data.errors?.length) {
          setDetails(data);
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const detailsNode =
    details != null
      ? renderDetails
        ? renderDetails(details)
        : <pre className="text-secondary">{JSON.stringify(details, null, 2)}</pre>
      : null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-background-secondary/50 backdrop-blur-md border-background-tertiary/50 hover:bg-background-secondary/70 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-primary">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary mb-4">{description}</p>

          {message && (
            <div
              className={`mb-4 p-3 rounded-md ${
                message.type === "success"
                  ? "bg-accent-primary/20 text-accent-primary"
                  : message.type === "info"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              {message.text}
            </div>
          )}

          {detailsNode && (
            <div className="mb-4 p-3 rounded-md bg-background-tertiary/30 text-xs max-h-64 overflow-auto">
              {detailsNode}
            </div>
          )}

          <Button onClick={handleTest} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                {loadingLabel}
              </>
            ) : (
              buttonLabel
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
