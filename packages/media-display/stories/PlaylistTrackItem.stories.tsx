import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PlaylistTrackItem, Track } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

const sampleTrack: Track = {
  id: '1',
  src: '/sample-audio.wav',
  title: 'Morning Sunrise',
  artist: 'Nature Sounds',
  duration: 180,
  coverArt: 'https://picsum.photos/seed/track1/100/100',
};

const trackWithoutArtist: Track = {
  id: '2',
  src: '/sample-audio.wav',
  title: 'Ocean Waves',
  duration: 240,
  coverArt: 'https://picsum.photos/seed/track2/100/100',
};

const trackWithoutDuration: Track = {
  id: '3',
  src: '/sample-audio.wav',
  title: 'Forest Birds',
  artist: 'Wildlife Audio',
  coverArt: 'https://picsum.photos/seed/track3/100/100',
};

const trackWithoutCover: Track = {
  id: '4',
  src: '/sample-audio.wav',
  title: 'Mountain Stream',
  artist: 'Ambient Collection',
  duration: 210,
};

const longTitleTrack: Track = {
  id: '5',
  src: '/sample-audio.wav',
  title: 'This Is A Very Long Track Title That Should Be Truncated When Displayed',
  artist: 'Artist With An Extremely Long Name That Should Also Be Truncated',
  duration: 300,
  coverArt: 'https://picsum.photos/seed/track5/100/100',
};

const meta: Meta<typeof PlaylistTrackItem> = {
  title: 'Media Display/PlaylistTrackItem',
  component: PlaylistTrackItem,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  argTypes: {
    isActive: {
      control: 'boolean',
      description: 'Whether this track is currently active/playing',
    },
    isPlaying: {
      control: 'boolean',
      description: 'Whether the track is actively playing (shows equalizer)',
    },
    trackNumber: {
      control: 'number',
      description: 'Track number to display (optional)',
    },
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Progress through the track (0-1)',
    },
    isLiked: {
      control: 'boolean',
      description: 'Whether track is liked/favorited',
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Size variant',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler to play this track',
    },
  },
  args: {
    isActive: false,
    isPlaying: false,
    isLiked: false,
    size: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof PlaylistTrackItem>;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={sampleTrack} onClick={() => {}} />
      </div>
    );
  },
};

export const Active: Story = {
  args: {
    isActive: true,
  },
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={sampleTrack} onClick={() => {}} />
      </div>
    );
  },
};

export const ActivePlaying: Story = {
  args: {
    isActive: true,
    isPlaying: true,
  },
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={sampleTrack} onClick={() => {}} />
      </div>
    );
  },
};

export const WithProgress: Story = {
  args: {
    isActive: true,
    isPlaying: true,
    progress: 0.45,
  },
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={sampleTrack} onClick={() => {}} />
      </div>
    );
  },
};

export const WithTrackNumber: Story = {
  args: {
    trackNumber: 1,
  },
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={sampleTrack} onClick={() => {}} />
      </div>
    );
  },
};

export const Liked: Story = {
  args: {
    isLiked: true,
  },
  render: (args) => {
    const [isLiked, setIsLiked] = useState(true);
    return (
      <div className="w-96">
        <PlaylistTrackItem
          {...args}
          track={sampleTrack}
          onClick={() => {}}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
        />
      </div>
    );
  },
};

export const WithoutCoverArt: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={trackWithoutCover} onClick={() => {}} />
      </div>
    );
  },
};

export const WithoutArtist: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={trackWithoutArtist} onClick={() => {}} />
      </div>
    );
  },
};

export const WithoutDuration: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={trackWithoutDuration} onClick={() => {}} />
      </div>
    );
  },
};

export const LongTitle: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={longTitleTrack} onClick={() => {}} />
      </div>
    );
  },
};

export const CompactSize: Story = {
  args: {
    size: 'compact',
  },
  render: (args) => {
    return (
      <div className="w-96">
        <PlaylistTrackItem {...args} track={sampleTrack} onClick={() => {}} trackNumber={1} />
      </div>
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const [isLiked, setIsLiked] = useState(false);

    return (
      <div className="w-96 space-y-2">
        <Text size="sm" color="muted" className="mb-2">
          Hover to see actions (like & more options)
        </Text>
        <PlaylistTrackItem
          track={sampleTrack}
          isActive={false}
          onClick={() => {}}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
          onMoreOptions={() => console.log('More options clicked')}
        />
      </div>
    );
  },
};

export const InteractiveList: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [likedTracks, setLikedTracks] = useState(new Set(['2']));

    const tracks: Track[] = [
      { id: '1', src: '/sample-audio.wav', title: 'Track One', artist: 'Artist A', duration: 180, coverArt: 'https://picsum.photos/seed/t1/100/100' },
      { id: '2', src: '/sample-audio.wav', title: 'Track Two', artist: 'Artist B', duration: 240, coverArt: 'https://picsum.photos/seed/t2/100/100' },
      { id: '3', src: '/sample-audio.wav', title: 'Track Three', artist: 'Artist C', duration: 120, coverArt: 'https://picsum.photos/seed/t3/100/100' },
      { id: '4', src: '/sample-audio.wav', title: 'Track Four', artist: 'Artist D', duration: 300 },
      { id: '5', src: '/sample-audio.wav', title: 'Track Five', artist: 'Artist E', duration: 210, coverArt: 'https://picsum.photos/seed/t5/100/100' },
    ];

    const toggleLike = (id: string) => {
      setLikedTracks((prev) => {
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
      <div className="w-96">
        <Text size="sm" weight="medium" className="mb-3">
          Click a track to select it:
        </Text>
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <PlaylistTrackItem
              key={track.id}
              track={track}
              isActive={index === activeIndex}
              isPlaying={index === activeIndex && isPlaying}
              trackNumber={index + 1}
              progress={index === activeIndex ? 0.35 : undefined}
              onClick={() => {
                setActiveIndex(index);
                setIsPlaying(true);
              }}
              isLiked={likedTracks.has(track.id)}
              onToggleLike={() => toggleLike(track.id)}
            />
          ))}
        </div>
        <div className="mt-3 p-3 bg-gray-800 rounded-lg">
          <Text size="xs" color="muted">
            Selected: {tracks[activeIndex].title}
          </Text>
          <Text size="xs" color="muted">
            Playing: {isPlaying ? 'Yes' : 'No'}
          </Text>
        </div>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [liked, setLiked] = useState(new Set(['1']));

    const toggleLike = (id: string) => {
      setLiked((prev) => {
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
      <ThemeSection
        title="Playlist Track Item"
        description="Individual track item component with cover art, hover states, animated equalizer, and action buttons. Supports liked state, progress bar, and multiple sizes."
      >
        <div className="space-y-8 max-w-lg">
          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Default State
            </Text>
            <PlaylistTrackItem
              track={sampleTrack}
              isActive={false}
              onClick={() => {}}
              trackNumber={1}
              isLiked={liked.has(sampleTrack.id)}
              onToggleLike={() => toggleLike(sampleTrack.id)}
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Active State (Paused)
            </Text>
            <PlaylistTrackItem
              track={sampleTrack}
              isActive={true}
              isPlaying={false}
              onClick={() => {}}
              trackNumber={2}
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Active State (Playing with Progress)
            </Text>
            <PlaylistTrackItem
              track={sampleTrack}
              isActive={true}
              isPlaying={true}
              progress={0.65}
              onClick={() => {}}
              trackNumber={3}
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Without Cover Art
            </Text>
            <PlaylistTrackItem
              track={trackWithoutCover}
              isActive={false}
              onClick={() => {}}
              trackNumber={4}
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Compact Size
            </Text>
            <PlaylistTrackItem
              track={sampleTrack}
              isActive={false}
              onClick={() => {}}
              trackNumber={5}
              size="compact"
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Compact Active & Playing
            </Text>
            <PlaylistTrackItem
              track={sampleTrack}
              isActive={true}
              isPlaying={true}
              onClick={() => {}}
              trackNumber={6}
              size="compact"
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Long Title (Truncated)
            </Text>
            <PlaylistTrackItem
              track={longTitleTrack}
              isActive={false}
              onClick={() => {}}
              trackNumber={7}
            />
          </div>
        </div>
      </ThemeSection>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
