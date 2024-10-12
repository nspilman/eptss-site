import { DataTable } from "@/components/DataTable";
import { roundProvider, userSessionProvider, votesProvider } from "@/providers";
import { notFound } from "next/navigation";

const AdminPage = async ({ searchParams }: { searchParams: { roundId?: string } }) => {
    const { email } = await userSessionProvider()
    if ((!email.length || email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) && process.env.NODE_ENV !== "development") {
        return notFound()
    }
    console.log(searchParams.roundId)

    const roundIdParam = searchParams.roundId ? Number(searchParams.roundId) : undefined;
    const { roundId, dates, voteOptions } = await roundProvider(roundIdParam);
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
        { key: 'phase', display: 'Phase', sortable: true },
        { key: 'opens', display: 'Opens', sortable: true },
        { key: 'closes', display: 'Closes', sortable: true }
    ];

    // Vote options table setup
    const voteOptionsArray = voteOptions.map((option, index) => ({
        label: option.label,
        link: option.link
    }));
    const voteOptionHeaders = [
        { key: 'label', display: 'Label', sortable: true },
        { key: 'link', display: 'Link', sortable: true }
    ];

    return (
        <>
            <h2>Round Dates</h2>
            <DataTable rows={datesArray} headers={dateHeaders} />
            <h2>Vote Options</h2>
            <DataTable rows={voteOptionsArray} headers={voteOptionHeaders} />
            <h2>Vote Results</h2>
            <DataTable rows={voteResults} headers={voteHeaders} />
        </>
    )
}

export default AdminPage;
