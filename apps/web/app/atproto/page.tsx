import { getEptssData, RoundList } from "@eptss/atproto";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EPTSS on the AT Protocol",
  description:
    "Every EPTSS round and submission, read straight off the AT Protocol network.",
};

export default async function AtprotoPage() {
  const data = await getEptssData();
  return <RoundList data={data} />;
}
