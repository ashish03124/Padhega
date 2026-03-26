"use client";

import React from 'react';
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  VideoConference,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface VideoCallProps {
  token: string;
  onLeave?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ token, onLeave }) => {
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!serverUrl) {
    return (
      <div className="video-error">
        <p>LiveKit URL is not configured.</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      onDisconnected={onLeave}
      // Use the default LiveKit theme for a professional look
      data-lk-theme="default"
      style={{ height: '100%', minHeight: '400px' }}
    >
      {/* 
        VideoConference is a high-level component that includes 
        the grid, control bar, and focus mode out of the box.
      */}
      <VideoConference />
      
      {/* The RoomAudioRenderer handles all incoming audio tracks automatically */}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

export default VideoCall;
