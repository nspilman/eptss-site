'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToWaitlist } from "@/actions/waitlist";
import { useToast } from "@/components/ui/use-toast";

type FormData = {
  name: string;
  email: string;
};

export function WaitlistForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addToWaitlist(formData);
      toast({
        title: "Success!",
        description: "You've been added to the waitlist. We'll contact you when registration opens for the next round.",
      });
      setFormData({ name: "", email: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem adding you to the waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
            Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
            className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
            className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050] font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Adding to waitlist..." : "Join Waitlist"}
      </Button>
    </form>
  );
} 