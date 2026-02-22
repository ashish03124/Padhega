import React from 'react';

const StudyGroupsSection: React.FC = () => {
    return (
        <section className="groups-box" id="community">
            <div className="section-header">
                <h2><i className="fas fa-users"></i> Study Groups</h2>
                <button className="btn btn-primary">
                    <i className="fas fa-plus"></i> Create
                </button>
            </div>
            <div className="group-list">
                <div className="group-item">
                    <div className="group-avatar">M</div>
                    <div className="group-info">
                        <div className="group-name">Mathematics Club</div>
                        <div className="group-members">12 members • Active now</div>
                    </div>
                    <button className="join-btn">Join</button>
                </div>
                <div className="group-item">
                    <div className="group-avatar">S</div>
                    <div className="group-info">
                        <div className="group-name">Science Study</div>
                        <div className="group-members">8 members • 3 online</div>
                    </div>
                    <button className="join-btn">Join</button>
                </div>
            </div>
        </section>
    );
};

export default StudyGroupsSection;
