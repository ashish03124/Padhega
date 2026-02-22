"use client";

import React, { useState } from 'react';
import { CreateRoomData, RoomPrivacy } from '../lib/studyRoomTypes';
import './modals.css';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateRoomData) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState<CreateRoomData>({
        name: '',
        description: '',
        subject: '',
        privacy: 'public',
        password: '',
        maxParticipants: 10,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Room name is required';
        }
        if (formData.privacy === 'password' && !formData.password) {
            newErrors.password = 'Password is required for password-protected rooms';
        }
        if (formData.maxParticipants < 2) {
            newErrors.maxParticipants = 'At least 2 participants required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onCreate(formData);
        onClose();

        // Reset form
        setFormData({
            name: '',
            description: '',
            subject: '',
            privacy: 'public',
            password: '',
            maxParticipants: 10,
        });
        setErrors({});
    };

    const handleChange = (field: keyof CreateRoomData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content create-room-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <i className="fas fa-plus-circle"></i> Create Study Room
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="room-name">
                            Room Name <span className="required">*</span>
                        </label>
                        <input
                            id="room-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g., Math Study Group"
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="What will you study together?"
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <select
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                            >
                                <option value="">Select subject...</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="History">History</option>
                                <option value="Literature">Literature</option>
                                <option value="Languages">Languages</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="max-participants">Max Participants</label>
                            <input
                                id="max-participants"
                                type="number"
                                value={formData.maxParticipants || ''}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 10 : parseInt(e.target.value) || 10;
                                    handleChange('maxParticipants', value);
                                }}
                                min="2"
                                max="50"
                            />
                            {errors.maxParticipants && (
                                <span className="error-message">{errors.maxParticipants}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Privacy</label>
                        <div className="privacy-options">
                            <label className={`privacy-option ${formData.privacy === 'public' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="public"
                                    checked={formData.privacy === 'public'}
                                    onChange={(e) => handleChange('privacy', e.target.value as RoomPrivacy)}
                                />
                                <div className="option-content">
                                    <i className="fas fa-globe"></i>
                                    <span>Public</span>
                                    <small>Anyone can join</small>
                                </div>
                            </label>

                            <label className={`privacy-option ${formData.privacy === 'private' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="private"
                                    checked={formData.privacy === 'private'}
                                    onChange={(e) => handleChange('privacy', e.target.value as RoomPrivacy)}
                                />
                                <div className="option-content">
                                    <i className="fas fa-lock"></i>
                                    <span>Private</span>
                                    <small>Invite only</small>
                                </div>
                            </label>

                            <label className={`privacy-option ${formData.privacy === 'password' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="password"
                                    checked={formData.privacy === 'password'}
                                    onChange={(e) => handleChange('privacy', e.target.value as RoomPrivacy)}
                                />
                                <div className="option-content">
                                    <i className="fas fa-key"></i>
                                    <span>Password</span>
                                    <small>Requires password</small>
                                </div>
                            </label>
                        </div>
                    </div>

                    {formData.privacy === 'password' && (
                        <div className="form-group">
                            <label htmlFor="password">
                                Password <span className="required">*</span>
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Enter room password"
                                className={errors.password ? 'error' : ''}
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <i className="fas fa-plus"></i> Create Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
