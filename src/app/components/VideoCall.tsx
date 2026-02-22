"use client";

import React, { useEffect, useRef } from 'react';
import { DailyCall } from '@daily-co/daily-js';
import { Participant } from '../hooks/useVideoCall';

interface VideoCallProps {
    callObject: DailyCall | null;
    participants: Record<string, Participant>;
}

const VideoCall: React.FC<VideoCallProps> = ({ callObject, participants }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

    useEffect(() => {
        if (!callObject) return;

        // Get all participant tracks and attach to video elements
        Object.entries(participants).forEach(([id, participant]) => {
            const videoEl = videoRefs.current[id];
            if (!videoEl) return;

            const tracks = callObject.participants()[id]?.tracks;
            if (!tracks) return;

            // Attach video track
            if (tracks.video?.track) {
                const stream = new MediaStream([tracks.video.track]);
                videoEl.srcObject = stream;
                videoEl.play().catch(e => console.error('Video play error:', e));
            }

            // Attach audio track (not for local participant to avoid echo)
            if (tracks.audio?.track && !participant.local) {
                const audioStream = new MediaStream([tracks.audio.track]);
                const audioEl = new Audio();
                audioEl.srcObject = audioStream;
                audioEl.play().catch(e => console.error('Audio play error:', e));
            }
        });
    }, [callObject, participants]);

    const participantList = Object.entries(participants);
    const gridClass = `video-grid grid-${Math.min(participantList.length, 6)}`;

    return (
        <div className="video-call-container" ref={containerRef}>
            <div className={gridClass}>
                {participantList.map(([id, participant]) => (
                    <div
                        key={id}
                        className={`video-tile ${participant.local ? 'local' : 'remote'} ${!participant.video ? 'video-off' : ''}`}
                    >
                        <video
                            ref={(el) => {
                                if (el) videoRefs.current[id] = el;
                            }}
                            autoPlay
                            playsInline
                            muted={participant.local}
                            className="participant-video"
                        />

                        {!participant.video && (
                            <div className="video-off-placeholder">
                                <div className="avatar">
                                    {participant.user_name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}

                        <div className="participant-info">
                            <span className="participant-name">
                                {participant.user_name} {participant.local && '(You)'}
                            </span>
                            <div className="participant-status">
                                {!participant.audio && (
                                    <i className="fas fa-microphone-slash muted-icon"></i>
                                )}
                                {participant.screen && (
                                    <i className="fas fa-desktop screen-icon"></i>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {participantList.length === 0 && (
                <div className="no-participants">
                    <i className="fas fa-users"></i>
                    <p>Waiting for participants to join...</p>
                </div>
            )}
        </div>
    );
};

export default VideoCall;
