import { DataTable } from "@/components/DataTable";
import { roundProvider, userSessionProvider, votesProvider } from "@/providers";
import { notFound } from "next/navigation";

const AdminPage = async ({searchParams}:  {searchParams: { roundId: string } }) => {
    const { email } = await userSessionProvider()
    if ((!email.length || email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) && process.env.NODE_ENV !== "development") {
        return notFound()
    }
    const { roundId, dates } = await roundProvider(searchParams.roundId ? JSON.parse(searchParams.roundId) : undefined);
    const { voteResults } = await votesProvider({ roundId })

    // Vote results table setup
    const voteResultsHeaderKeys = ["title", "artist", "average", "votesCount"] as const;
    const voteHeaders = voteResultsHeaderKeys.map(key => ({
        key: key, display: key, sortable: true
    }));

    // Dates table setup
    const datesArray = Object.entries(dates).map(([key, { opens, closes }]) => ({
        phase: key,
        opens: new Date(opens).toLocaleString(),
        closes: new Date(closes).toLocaleString()
    }));
    const dateHeaders = [
        { key: 'phase', display: 'Phase', sortable: false },
        { key: 'opens', display: 'Opens', sortable: false },
        { key: 'closes', display: 'Closes', sortable: false }
    ];

    return (
        <>
            <h2>Round Dates</h2>
            <DataTable rows={datesArray} headers={dateHeaders} />
            <h2>Vote Results</h2>
            <DataTable rows={voteResults} headers={voteHeaders} />
        </>
    )
}

export default AdminPage;
