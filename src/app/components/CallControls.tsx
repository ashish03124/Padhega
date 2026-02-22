"use client";

import React from 'react';

interface CallControlsProps {
    isCameraOn: boolean;
    isMicOn: boolean;
    isScreenSharing: boolean;
    onToggleCamera: () => void;
    onToggleMic: () => void;
    onToggleScreenShare: () => void;
    onLeaveCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
    isCameraOn,
    isMicOn,
    isScreenSharing,
    onToggleCamera,
    onToggleMic,
    onToggleScreenShare,
    onLeaveCall,
}) => {
    return (
        <div className="call-controls">
            <div className="controls-group">
                <button
                    className={`control-btn ${!isMicOn ? 'active-danger' : ''}`}
                    onClick={onToggleMic}
                    title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                    <i className={`fas fa-${isMicOn ? 'microphone' : 'microphone-slash'}`}></i>
                    <span>{isMicOn ? 'Mute' : 'Unmuted'}</span>
                </button>

                <button
                    className={`control-btn ${!isCameraOn ? 'active-danger' : ''}`}
                    onClick={onToggleCamera}
                    title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                >
                    <i className={`fas fa-${isCameraOn ? 'video' : 'video-slash'}`}></i>
                    <span>{isCameraOn ? 'Camera' : 'No Video'}</span>
                </button>

                <button
                    className={`control-btn ${isScreenSharing ? 'active-primary' : ''}`}
                    onClick={onToggleScreenShare}
                    title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
                >
                    <i className="fas fa-desktop"></i>
                    <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
                </button>
            </div>

            <button
                className="control-btn leave-btn"
                onClick={onLeaveCall}
                title="Leave call"
            >
                <i className="fas fa-phone-slash"></i>
                <span>Leave</span>
            </button>
        </div>
    );
};

export default CallControls;
