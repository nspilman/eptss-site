import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Playlist, Track } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

// Real tracks from local music library
const sampleTracks: Track[] = [
  {
    id: '1',
    src: '/track1-electric-feel.mp3',
    title: 'Electric Feel',
    artist: 'Final Mix',
    duration: 318,
    coverArt: 'https://picsum.photos/seed/electric/400/400',
  },
  {
    id: '2',
    src: '/track2-boxes-and-letters.mp3',
    title: 'Boxes and Letters',
    artist: 'Original',
    duration: 93,
    coverArt: 'https://picsum.photos/seed/boxes/400/400',
  },
  {
    id: '3',
    src: '/track3-is-this-jazz.mp3',
    title: 'Is This Jazz?',
    artist: 'Experimental',
    duration: 86,
    coverArt: 'https://picsum.photos/seed/jazz/400/400',
  },
  {
    id: '4',
    src: '/track4-tropical-beat.mp3',
    title: 'Tropical Beat',
    artist: 'Island Vibes',
    duration: 90,
    coverArt: 'https://picsum.photos/seed/tropical/400/400',
  },
  {
    id: '5',
    src: '/track5-on-my-mind.mp3',
    title: 'On My Mind',
    artist: 'Thoughts',
    duration: 163,
    coverArt: 'https://picsum.photos/seed/mind/400/400',
  },
];

// Tracks without cover art for variety
const mixedTracks: Track[] = [
  { ...sampleTracks[0] },
  { id: '2b', src: '/track2-boxes-and-letters.mp3', title: 'Track Without Cover', artist: 'Mystery Artist', duration: 93 },
  { ...sampleTracks[2] },
  { id: '4b', src: '/track4-tropical-beat.mp3', title: 'Another No Cover', artist: 'Unknown', duration: 90 },
  { ...sampleTracks[4] },
];

const meta: Meta<typeof Playlist> = {
  title: 'Media Display/Playlist',
  component: Playlist,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  argTypes: {
    autoPlayNext: {
      control: 'boolean',
      description: 'Auto-advance to next track when current track ends',
    },
    showTrackList: {
      control: 'boolean',
      description: 'Show the track list',
    },
    showControls: {
      control: 'boolean',
      description: 'Show playlist controls (next/previous/shuffle/repeat)',
    },
    showTrackNumbers: {
      control: 'boolean',
      description: 'Show track numbers in the list',
    },
    showWaveform: {
      control: 'boolean',
      description: 'Show waveform in now playing card',
    },
    layout: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Layout variant',
    },
    onTrackChange: {
      action: 'trackChanged',
      description: 'Callback when track changes',
    },
    onPlaylistEnd: {
      action: 'playlistEnded',
      description: 'Callback when playlist ends',
    },
  },
  args: {
    autoPlayNext: true,
    showTrackList: true,
    showControls: true,
    showTrackNumbers: true,
    showWaveform: true,
    layout: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof Playlist>;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist {...args} tracks={sampleTracks} />
      </div>
    );
  },
};

export const WithTitle: Story = {
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist
          {...args}
          tracks={sampleTracks}
          title="Relaxation Mix"
          description="Soothing sounds for meditation and focus"
        />
      </div>
    );
  },
};

export const CompactLayout: Story = {
  args: {
    layout: 'compact',
  },
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist
          {...args}
          tracks={sampleTracks}
          title="Compact Playlist"
        />
      </div>
    );
  },
};


export const WithLikes: Story = {
  render: (args) => {
    const [likedIds, setLikedIds] = useState(new Set(['1', '3']));

    const toggleLike = (id: string) => {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist
          {...args}
          tracks={sampleTracks}
          title="My Favorites"
          likedTrackIds={likedIds}
          onToggleLike={toggleLike}
        />
      </div>
    );
  },
};

export const WithoutControls: Story = {
  args: {
    showControls: false,
  },
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist {...args} tracks={sampleTracks} />
      </div>
    );
  },
};

export const WithoutTrackList: Story = {
  args: {
    showTrackList: false,
  },
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist {...args} tracks={sampleTracks} />
      </div>
    );
  },
};

export const WithoutTrackNumbers: Story = {
  args: {
    showTrackNumbers: false,
  },
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist {...args} tracks={sampleTracks} />
      </div>
    );
  },
};

export const NoWaveform: Story = {
  args: {
    showWaveform: false,
  },
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist {...args} tracks={sampleTracks} />
      </div>
    );
  },
};

export const SingleTrack: Story = {
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist {...args} tracks={[sampleTracks[0]]} title="Single Track" />
      </div>
    );
  },
};

export const EmptyPlaylist: Story = {
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist {...args} tracks={[]} />
      </div>
    );
  },
};

export const MixedCoverArt: Story = {
  render: (args) => {
    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist
          {...args}
          tracks={mixedTracks}
          title="Mixed Media"
          description="Some tracks with cover art, some without"
        />
      </div>
    );
  },
};

// Available track sources to cycle through
const trackSources = [
  '/track1-electric-feel.mp3',
  '/track2-boxes-and-letters.mp3',
  '/track3-is-this-jazz.mp3',
  '/track4-tropical-beat.mp3',
  '/track5-on-my-mind.mp3',
];

export const ScrollableList: Story = {
  render: (args) => {
    const longTracks: Track[] = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      src: trackSources[i % trackSources.length],
      title: `Track ${i + 1}`,
      artist: `Artist ${Math.floor(i / 4) + 1}`,
      duration: 90 + (i % 5) * 30,
      coverArt: `https://picsum.photos/seed/track${i}/400/400`,
    }));

    return (
      <div className="w-full sm:w-[400px] md:w-[512px]">
        <Playlist
          {...args}
          tracks={longTracks}
          title="Long Playlist"
          description="20 tracks with scrollable list"
          maxTrackListHeight={400}
        />
      </div>
    );
  },
};

export const WithCallbacks: Story = {
  render: (args) => {
    const [events, setEvents] = useState<string[]>([]);

    const addEvent = (event: string) => {
      setEvents((prev) => [...prev.slice(-4), event]);
    };

    return (
      <div className="w-full sm:w-[400px] md:w-[512px] space-y-4">
        <Playlist
          {...args}
          tracks={sampleTracks}
          title="Interactive Playlist"
          onTrackChange={(track, index) => {
            addEvent(`Track changed: ${track.title} (index ${index})`);
          }}
          onPlaylistEnd={() => {
            addEvent('Playlist ended');
          }}
        />

        <div className="p-4 bg-gray-800 rounded-lg">
          <Text size="sm" weight="medium" className="mb-2">
            Event Log:
          </Text>
          {events.length === 0 ? (
            <Text size="xs" color="muted">
              No events yet. Click tracks or use controls.
            </Text>
          ) : (
            <ul className="space-y-1">
              {events.map((event, i) => (
                <li key={i}>
                  <Text size="xs" color="muted">
                    {event}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
};

export const AllLayouts: Story = {
  render: () => {
    return (
      <ThemeSection
        title="Playlist"
        description="Modern audio playlist with hero player, track list, and rich interactions. Supports multiple layouts and customization options."
      >
        <div className="space-y-12 w-full md:w-[600px]">
          <div>
            <Text size="sm" weight="medium" className="mb-4">
              Default Layout
            </Text>
            <div className="w-full sm:w-[400px] md:w-[512px]">
              <Playlist
                tracks={sampleTracks.slice(0, 3)}
                title="Default Playlist"
                description="Standard vertical layout"
                autoPlayNext
                showControls
                showTrackList
                showTrackNumbers
              />
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-4">
              Compact Layout
            </Text>
            <div className="w-full sm:w-[400px] md:w-[512px]">
              <Playlist
                tracks={sampleTracks.slice(0, 3)}
                title="Compact Playlist"
                layout="compact"
                autoPlayNext
                showControls
                showTrackList
              />
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-4">
              Player Only (No Track List)
            </Text>
            <div className="w-full sm:w-[400px] md:w-[512px]">
              <Playlist
                tracks={sampleTracks}
                autoPlayNext
                showControls
                showTrackList={false}
              />
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-4">
              Empty State
            </Text>
            <div className="w-full sm:w-[400px] md:w-[512px]">
              <Playlist tracks={[]} />
            </div>
          </div>
        </div>
      </ThemeSection>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
