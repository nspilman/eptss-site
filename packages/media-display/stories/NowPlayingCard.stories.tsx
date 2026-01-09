import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { NowPlayingCard, Track } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

const sampleTrack: Track = {
  id: '1',
  src: '/sample-audio.wav',
  title: 'Morning Sunrise',
  artist: 'Nature Sounds',
  duration: 180,
  coverArt: 'https://picsum.photos/seed/track1/400/400',
};

const trackWithoutCover: Track = {
  id: '2',
  src: '/sample-audio.wav',
  title: 'Ocean Waves',
  artist: 'Relaxation Music',
  duration: 240,
};

const longTitleTrack: Track = {
  id: '3',
  src: '/sample-audio.wav',
  title: 'This Is A Very Long Track Title That Should Be Truncated',
  artist: 'Artist With An Extremely Long Name',
  duration: 300,
  coverArt: 'https://picsum.photos/seed/track3/400/400',
};

const meta: Meta<typeof NowPlayingCard> = {
  title: 'Media Display/NowPlayingCard',
  component: NowPlayingCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  argTypes: {
    isPlaying: {
      control: 'boolean',
      description: 'Whether audio is currently playing',
    },
    shuffle: {
      control: 'boolean',
      description: 'Shuffle mode enabled',
    },
    repeat: {
      control: 'select',
      options: ['none', 'one', 'all'],
      description: 'Repeat mode',
    },
    showControls: {
      control: 'boolean',
      description: 'Show playback controls',
    },
    showWaveform: {
      control: 'boolean',
      description: 'Show waveform visualization',
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Size variant',
    },
    onPlayPause: {
      action: 'playPause',
    },
    onNext: {
      action: 'next',
    },
    onPrevious: {
      action: 'previous',
    },
  },
  args: {
    isPlaying: false,
    shuffle: false,
    repeat: 'none',
    showControls: true,
    showWaveform: true,
    size: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof NowPlayingCard>;

export const Default: Story = {
  render: (args) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
      <div className="w-full max-w-lg">
        <NowPlayingCard
          {...args}
          track={sampleTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      </div>
    );
  },
};

export const Playing: Story = {
  render: (args) => {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
      <div className="w-full max-w-lg">
        <NowPlayingCard
          {...args}
          track={sampleTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      </div>
    );
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
  },
  render: (args) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
      <div className="w-full max-w-lg">
        <NowPlayingCard
          {...args}
          track={sampleTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      </div>
    );
  },
};

export const WithoutCoverArt: Story = {
  render: (args) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
      <div className="w-full max-w-lg">
        <NowPlayingCard
          {...args}
          track={trackWithoutCover}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      </div>
    );
  },
};

export const WithLike: Story = {
  render: (args) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    return (
      <div className="w-full max-w-lg">
        <NowPlayingCard
          {...args}
          track={sampleTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
        />
      </div>
    );
  },
};

export const WithAllControls: Story = {
  render: (args) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
    const [isLiked, setIsLiked] = useState(true);

    const toggleRepeat = () => {
      setRepeat(repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none');
    };

    return (
      <div className="w-full max-w-lg">
        <NowPlayingCard
          {...args}
          track={sampleTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={() => console.log('Next')}
          onPrevious={() => console.log('Previous')}
          shuffle={shuffle}
          onToggleShuffle={() => setShuffle(!shuffle)}
          repeat={repeat}
          onToggleRepeat={toggleRepeat}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
        />
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <Text size="xs" color="muted">
            Shuffle: {shuffle ? 'On' : 'Off'} | Repeat: {repeat} | Liked: {isLiked ? 'Yes' : 'No'}
          </Text>
        </div>
      </div>
    );
  },
};

export const NoWaveform: Story = {
  args: {
    showWaveform: false,
  },
  render: (args) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
      <div className="w-full max-w-lg">
        <NowPlayingCard
          {...args}
          track={sampleTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      </div>
    );
  },
};

export const LongTitle: Story = {
  render: (args) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
      <div className="w-full max-w-lg">
        <NowPlayingCard
          {...args}
          track={longTitleTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [playing1, setPlaying1] = useState(false);
    const [playing2, setPlaying2] = useState(false);
    const [playing3, setPlaying3] = useState(false);

    return (
      <ThemeSection
        title="Now Playing Card"
        description="Hero component for displaying the currently playing track with large cover art, waveform visualization, and full playback controls."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Default Size
            </Text>
            <NowPlayingCard
              track={sampleTrack}
              isPlaying={playing1}
              onPlayPause={() => setPlaying1(!playing1)}
              onNext={() => {}}
              onPrevious={() => {}}
              onToggleShuffle={() => {}}
              onToggleRepeat={() => {}}
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Compact Size
            </Text>
            <NowPlayingCard
              track={sampleTrack}
              isPlaying={playing2}
              onPlayPause={() => setPlaying2(!playing2)}
              size="compact"
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              Without Cover Art
            </Text>
            <NowPlayingCard
              track={trackWithoutCover}
              isPlaying={playing3}
              onPlayPause={() => setPlaying3(!playing3)}
              onNext={() => {}}
              onPrevious={() => {}}
            />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">
              No Waveform
            </Text>
            <NowPlayingCard
              track={sampleTrack}
              isPlaying={false}
              onPlayPause={() => {}}
              showWaveform={false}
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
