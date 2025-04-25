import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools } from 'react-icons/fa';
import './UserProfile.css';
import Pro from './img/img.png';
import NavBar from '../../Components/NavBar/NavBar';
import { initParticles } from '../../utils/particleAnimation';

export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function GoogalUserPro() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userID');
    const [googleProfileImage, setGoogleProfileImage] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);

        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        if (canvasRef.current) {
            initParticles(canvasRef.current, savedDarkMode);
        }

        const handleResize = () => {
            if (canvasRef.current) {
                initParticles(canvasRef.current, savedDarkMode);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            fetchUserDetails(userId).then((data) => setUserData(data));
        }
    }, []);

    useEffect(() => {
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        if (storedUserType === 'google') {
            const googleImage = localStorage.getItem('googleProfileImage');
            setGoogleProfileImage(googleImage);
        } else if (userId) {
            fetchUserDetails(userId).then((data) => {
                if (data && data.profilePicturePath) {
                    setUserProfileImage(`http://localhost:8080/uploads/profile/${data.profilePicturePath}`);
                }
            });
        }
    }, [userId]);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
        document.body.classList.toggle('dark-mode');

        if (canvasRef.current) {
            initParticles(canvasRef.current, newDarkMode);
        }
    };

    const handleDelete = () => {
        const userId = localStorage.getItem('userID');
        fetch(`http://localhost:8080/user/${userId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (response.ok) {
                    setDeleteSuccess(true);
                    setTimeout(() => {
                        localStorage.removeItem('userID');
                        navigate('/'); // Redirect to home or login page
                    }, 2000);
                } else {
                    setDeleteError(true);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setDeleteError(true);
            });
    };

    const getProfileImage = () => {
        if (googleProfileImage) return googleProfileImage;
        if (userProfileImage) return userProfileImage;
        return Pro;
    };

    return (
        <div className={`profile-page-container ${darkMode ? 'dark-mode' : ''}`}>
            <canvas ref={canvasRef} className="particles-background"></canvas>
            <div className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                <span className="theme-toggle-tooltip">{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <NavBar />
            <div className="profile-dashboard">
                <div className="profile-dashboard-header">
                    <h1>My Profile Dashboard</h1>
                </div>

                <div className="profile-content-wrapper">
                    <div className="profile-sidebar">
                        <div className="profile-avatar-container">
                            <img
                                src={getProfileImage()}
                                alt="Profile"
                                className="profile-avatar"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = Pro;
                                }}
                            />
                            <div className="profile-presence-indicator"></div>
                        </div>

                        <div className="sidebar-nav">
                            <div className="sidebar-nav-item active">
                                <span className="sidebar-icon">👤</span>
                                <span>My Profile</span>
                            </div>
                            <div className="sidebar-nav-item" onClick={() => (window.location.href = '/myLearningPlan')}>
                                <span className="sidebar-icon">📚</span>
                                <span>Learning Plan</span>
                            </div>
                            <div className="sidebar-nav-item" onClick={() => (window.location.href = '/myAllPost')}>
                                <span className="sidebar-icon">✍️</span>
                                <span>Skill Posts</span>
                            </div>
                            <div className="sidebar-nav-item" onClick={() => (window.location.href = '/myAchievements')}>
                                <span className="sidebar-icon">🏆</span>
                                <span>Achievements</span>
                            </div>
                            <div className="sidebar-nav-item">
                                <span className="sidebar-icon">⚙️</span>
                                <span>Settings</span>
                            </div>
                        </div>

                        <div className="profile-actions vertical">
                            <button onClick={() => setShowDeleteModal(true)} className="delete-button">
                                <span className="button-icon">🗑️</span>
                                Delete Account
                            </button>
                        </div>
                    </div>

                    <div className="profile-main-content">
                        {userData && userData.id === localStorage.getItem('userID') && (
                            <div className="user-data-display">
                                <div className="user_data_card">
                                    <div className="user_data_card_header">
                                        <div className="user-header-content">
                                            <h2 className="username_card">{userData.fullname}</h2>
                                            <div className="user-title">Google User</div>
                                        </div>
                                        <div className="status-indicator">
                                            <span className="status-dot"></span>
                                            <span className="status-text">Online</span>
                                        </div>
                                    </div>

                                    <div className="profile-stats">
                                        <div className="stat-item">
                                            <span className="stat-value">{userData.skills?.length || 0}</span>
                                            <span className="stat-label">Skills</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">24</span>
                                            <span className="stat-label">Projects</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">142</span>
                                            <span className="stat-label">Connections</span>
                                        </div>
                                    </div>

                                    <div className="bio-section">
                                        <div className="section-header">
                                            <span className="section-icon">📝</span>
                                            <h3 className="section-title">About Me</h3>
                                        </div>
                                        <p className="user_data_card_item_bio">{userData.bio || 'No bio added yet'}</p>
                                    </div>

                                    <div className="contact-info-section">
                                        <div className="section-header">
                                            <span className="section-icon">📇</span>
                                            <h3 className="section-title">Contact Info</h3>
                                        </div>
                                        <div className="info-item">
                                            <div className="info-icon-wrapper">
                                                <FaEnvelope className="user_data_card_icon" />
                                            </div>
                                            <div className="info-content">
                                                <span className="info-label">Email</span>
                                                <p className="info-value">{userData.email}</p>
                                            </div>
                                        </div>
                                        {userData.phone && (
                                            <div className="info-item">
                                                <div className="info-icon-wrapper">
                                                    <FaPhone className="user_data_card_icon" />
                                                </div>
                                                <div className="info-content">
                                                    <span className="info-label">Phone</span>
                                                    <p className="info-value">{userData.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {userData.skills && userData.skills.length > 0 && (
                                            <div className="info-item">
                                                <div className="info-icon-wrapper">
                                                    <FaTools className="user_data_card_icon" />
                                                </div>
                                                <div className="info-content">
                                                    <span className="info-label">Skills</span>
                                                    <div className="skills-tags">
                                                        {userData.skills.map((skill, index) => (
                                                            <span key={index} className="skill-tag">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {!deleteSuccess && !deleteError ? (
                            <>
                                <div className="modal-header">
                                    <h3>Delete Account</h3>
                                    <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <div className="delete-warning-icon">⚠️</div>
                                    <p>Are you sure you want to delete your account?</p>
                                    <p className="modal-text-danger">This action cannot be undone and all your data will be permanently removed.</p>
                                </div>
                                <div className="modal-footer">
                                    <button className="modal-cancel-button" onClick={() => setShowDeleteModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="modal-delete-button" onClick={handleDelete}>
                                        Yes, Delete My Account
                                    </button>
                                </div>
                            </>
                        ) : deleteSuccess ? (
                            <div className="modal-success">
                                <div className="success-icon">✓</div>
                                <h3>Account Deleted Successfully</h3>
                                <p>You'll be redirected to the home page...</p>
                            </div>
                        ) : (
                            <div className="modal-error">
                                <div className="error-icon">✕</div>
                                <h3>Error Deleting Account</h3>
                                <p>Please try again later or contact support.</p>
                                <button className="modal-close-button" onClick={() => setDeleteError(false)}>
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GoogalUserPro;
