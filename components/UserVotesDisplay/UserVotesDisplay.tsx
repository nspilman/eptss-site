interface VotedSong {
  title: string;
  artist: string;
  rating: number;
}

interface UserVotesDisplayProps {
  votedSongs: VotedSong[];
}

export function UserVotesDisplay({ votedSongs }: UserVotesDisplayProps) {
  if (!votedSongs || votedSongs.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-lg bg-background-secondary border border-accent-secondary">
      <h3 className="text-lg font-medium text-primary mb-3">Your Votes</h3>
      <div className="space-y-3">
        {votedSongs.map((song, index) => (
          <div 
            key={index} 
            className={`pb-3 ${index < votedSongs.length - 1 ? 'border-b border-gray-700' : ''}`}
          >
            <p className="text-base text-primary font-medium">
              {song.title} by {song.artist}
            </p>
            <p className="mt-1 text-sm text-[var(--color-accent-primary)]">
              Rating: {'⭐'.repeat(song.rating)} ({song.rating}/5)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
