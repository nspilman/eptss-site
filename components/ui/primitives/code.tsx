'use client';

import * as React from "react"
import { cn } from "./utils"
import { Button } from "./button"

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  code: string
  title?: string
}

function Code({ code, title = "Code", className, ...props }: CodeProps) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className={cn(
      "bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg border border-gray-800 p-4",
      className
    )} {...props}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">{title}</span>
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="sm"
          className="hover:bg-gray-800/50"
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="bg-black/30 rounded p-3 overflow-x-auto">
        <code className="text-sm font-mono break-all text-gray-300">{code}</code>
      </pre>
    </div>
  )
}

export { Code }
export type { CodeProps }
