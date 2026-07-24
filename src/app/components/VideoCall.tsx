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
  useConnectionState,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface VideoCallProps {
  token: string;
  onLeave?: () => void;
  onRetry?: () => void;
}

const ConnectionStateMonitor: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  const connectionState = useConnectionState();

  if (connectionState === 'connecting') {
    return (
      <div className="lk-connection-status-overlay">
        <div className="lk-status-card">
          <div className="spinner-small"></div>
          <h3>Connecting...</h3>
          <p>Connecting to study room servers.</p>
        </div>
      </div>
    );
  }

  if (connectionState === 'reconnecting') {
    return (
      <div className="lk-connection-status-overlay">
        <div className="lk-status-card warning">
          <div className="spinner-small warning"></div>
          <h3>Reconnecting...</h3>
          <p>Your network dropped. Restoring audio/video streams.</p>
        </div>
      </div>
    );
  }

  if (connectionState === 'disconnected') {
    return (
      <div className="lk-connection-status-overlay">
        <div className="lk-status-card danger">
          <i className="fas fa-exclamation-triangle status-icon-large"></i>
          <h3>Disconnected</h3>
          <p>Check your internet connection or try reconnecting.</p>
          {onRetry && (
            <button className="btn btn-primary" onClick={onRetry}>
              <i className="fas fa-redo"></i> Reconnect
            </button>
          )}
        </div>
      </div>
    );
  }

  // Connected state: show a brief subtle toast in corner
  return (
    <div className="lk-connection-status-toast">
      <span className="dot connected"></span> Connected
    </div>
  );
};

const VideoCall: React.FC<VideoCallProps> = ({ token, onLeave, onRetry }) => {
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
      style={{ height: '100%', minHeight: '400px', position: 'relative' }}
    >
      {/* 
        VideoConference is a high-level component that includes 
        the grid, control bar, and focus mode out of the box.
      */}
      <VideoConference />
      
      {/* The RoomAudioRenderer handles all incoming audio tracks automatically */}
      <RoomAudioRenderer />

      {/* Custom connection status overlays */}
      <ConnectionStateMonitor onRetry={onRetry} />
    </LiveKitRoom>
  );
};

export default VideoCall;
