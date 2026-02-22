import React, { useState } from 'react';

const ResourcesSection: React.FC = () => {
    const [showAddResourceModal, setShowAddResourceModal] = useState(false);

    const handleAddResource = (e: React.FormEvent) => {
        e.preventDefault();
        // Implementation for adding resource
        setShowAddResourceModal(false);
    };

    return (
        <section className="resources-box" id="resources">
            <div className="section-header">
                <h2><i className="fas fa-book-open"></i> Smart Resources</h2>
                <div className="resource-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddResourceModal(true)}
                    >
                        <i className="fas fa-plus"></i> Add
                    </button>
                    <div className="resource-search">
                        <input type="text" placeholder="Search resources..." />
                        <i className="fas fa-search"></i>
                    </div>
                </div>
            </div>

            <div className="resource-categories">
                <button className="category-btn active">All</button>
                <button className="category-btn">Videos</button>
                <button className="category-btn">Notes</button>
                <button className="category-btn">Practice</button>
            </div>

            <div className="resources-grid">
                {/* Resources will be dynamically loaded here */}
            </div>

            {showAddResourceModal && (
                <div className="add-resource-modal" onClick={() => setShowAddResourceModal(false)}>
                    <div className="add-resource-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-modal" onClick={() => setShowAddResourceModal(false)}>
                            &times;
                        </span>
                        <h3><i className="fas fa-plus-circle"></i> Add New Resource</h3>
                        <form onSubmit={handleAddResource}>
                            <div className="form-group">
                                <label>Resource Title</label>
                                <input type="text" required />
                            </div>
                            <div className="form-group">
                                <label>Resource URL</label>
                                <input type="url" required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows={3}></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select required>
                                        <option value="">Select category</option>
                                        <option value="video">Video Lecture</option>
                                        <option value="notes">Study Notes</option>
                                        <option value="practice">Practice Problems</option>
                                        <option value="book">E-Book</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Duration (mins)</label>
                                    <input type="number" min="1" defaultValue="30" />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-save"></i> Save
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowAddResourceModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ResourcesSection;
