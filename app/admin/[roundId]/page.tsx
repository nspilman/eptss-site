import { DataTable } from "@/components/DataTable";
import { roundProvider, votesProvider } from "@/providers";
import { isAdmin } from "@/utils/isAdmin";
import { notFound } from "next/navigation";

const AdminRoundPage = async ({ params }: { params: { roundId: string } }) => {
    if(!(await isAdmin())){
        return notFound();
    }

    const roundIdParam = Number(params.roundId);
    const { roundId, dateLabels, voteOptions } = await roundProvider(roundIdParam);
    const { voteResults, outstandingVoters } = await votesProvider({ roundId })
    
    // Vote results table setup
    const voteResultsHeaderKeys = ["title", "artist", "average", "votesCount"] as const;
    const voteHeaders = voteResultsHeaderKeys.map(key => ({
        key: key, display: key, sortable: true
    }));

    const datesArray = Object.entries(dateLabels)?.map(([key, { opens, closes }]) => ({
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
        label: `${option.song.title} - ${option.song.artist}`,
        link: option.youtubeLink || ''
    }));
    const voteOptionHeaders = [
        { key: 'label', display: 'Label', sortable: true },
        { key: 'link', display: 'Link', sortable: true }
    ];

    const outstandingVotesHeader = [
        {key: "email", display: "Email", sortable: true}
    ]

    return (
        <>
            <h2>Round Dates</h2>
            <DataTable rows={datesArray} headers={dateHeaders} />
            <h2>Vote Options</h2>
            <DataTable rows={voteOptionsArray} headers={voteOptionHeaders} />
            <h2>Outstanding Voters</h2>
            <DataTable rows={outstandingVoters.map(email => ({email}))} headers={outstandingVotesHeader}/>
            <h2>Vote Results</h2>
            <DataTable rows={voteResults} headers={voteHeaders} />
        </>
    )
}

export default AdminRoundPage; 