"use client"

import { FieldValues, Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Props<T extends FieldValues> {
  field: Path<T>;
  optional?: boolean;
  defaultValue?: string;
}

export function VoteInput<T extends FieldValues>({
  field,
  optional,
  defaultValue,
}: Props<T>) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(defaultValue);

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between pt-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center">
            <input
              type="radio"
              id={`${field}-${value}`}
              name={field}
              value={value.toString()}
              className="sr-only"
              defaultChecked={defaultValue === value.toString()}
              onChange={() => handleChange(value.toString())}
            />
            <Label
              htmlFor={`${field}-${value}`}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                selectedValue === value.toString()
                  ? "bg-[#e2e240] border-[#e2e240] text-[#0a0a1e]"
                  : "border-gray-600 text-gray-400 hover:border-[#e2e240] hover:text-[#e2e240]"
              }`}>
                {value}
              </div>
              <span className="mt-1 text-xs text-gray-400">
                {value === 1 ? "No" : value === 5 ? "Yes!" : ""}
              </span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}