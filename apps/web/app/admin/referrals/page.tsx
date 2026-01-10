import { Metadata } from 'next/types';
import { ReferralsTab } from "@eptss/admin";

export const metadata: Metadata = {
  title: "Referrals | Admin | Everyone Plays the Same Song",
  description: "View and manage user referrals",
};

export default function AdminReferralsPage() {
  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Referrals</h2>
        <p className="text-secondary">View all user referrals and referral codes</p>
      </div>

      <ReferralsTab />
    </div>
  );
}
