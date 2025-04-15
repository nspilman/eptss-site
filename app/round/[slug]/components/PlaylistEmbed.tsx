import React from "react";

interface PlaylistEmbedProps {
  playlistUrl: string;
}

export const PlaylistEmbed = ({ playlistUrl }: PlaylistEmbedProps) => (
  <div
    className={`w-[400px] sm:w-[600px] md:w-[800px] lg:w-[1000px]`}
    dangerouslySetInnerHTML={{ __html: playlistUrl || "" }}
  />
);
