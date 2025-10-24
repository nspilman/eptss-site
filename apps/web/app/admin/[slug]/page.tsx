import { DataTable } from "@/components/DataTable";
import { roundProvider, votesProvider } from "@/providers";
import { isAdmin } from "@/utils/isAdmin";
import { notFound } from "next/navigation";

const AdminRoundPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    if(!(await isAdmin())){
        return notFound();
    }

    const resolvedParams = await params;
    const slugParam = resolvedParams.slug;
    const { dateLabels, voteOptions } = await roundProvider(slugParam);
    const { voteResults, outstandingVoters } = await votesProvider({ roundSlug: slugParam })
    
    // Vote results table setup
    const voteResultsHeaderKeys = ["title", "artist", "average", "votesCount"] as const;
    const voteHeaders = voteResultsHeaderKeys.map(key => ({
        key: key, label: key, sortable: true
    }));

    const datesArray = Object.entries(dateLabels)?.map(([key, { opens, closes }]) => ({
        phase: key,
        opens: new Date(opens).toLocaleString(),
        closes: new Date(closes).toLocaleString()
    }));
    const dateHeaders = [
        { key: 'phase', label: 'Phase', sortable: true },
        { key: 'opens', label: 'Opens', sortable: true },
        { key: 'closes', label: 'Closes', sortable: true }
    ];

    // Vote options table setup
    const voteOptionsArray = voteOptions.map((option, index) => ({
        label: `${option.song.title} - ${option.song.artist}`,
        link: option.youtubeLink || ''
    }));
    const voteOptionHeaders = [
        { key: 'label', label: 'Label', sortable: true },
        { key: 'link', label: 'Link', sortable: true }
    ];

    const outstandingVotesHeader = [
        {key: "email", label: "Email", sortable: true}
    ]

    return (
        <>
            <h2>Round Dates</h2>
            <DataTable rows={datesArray} headers={dateHeaders} allowCopy={true} />
            <h2>Vote Options</h2>
            <DataTable rows={voteOptionsArray} headers={voteOptionHeaders} allowCopy={true} />
            <h2>Outstanding Voters</h2>
            <DataTable rows={outstandingVoters.map(email => ({email: email || ''}))} headers={outstandingVotesHeader} allowCopy={true} />
            <h2>Vote Results</h2>
            <DataTable rows={voteResults} headers={voteHeaders} allowCopy={true} />
        </>
    )
}

export default AdminRoundPage; 