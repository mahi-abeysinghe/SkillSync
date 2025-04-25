import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import { FaUserCircle } from 'react-icons/fa';
import NavBar from '../../Components/NavBar/NavBar';
import { initParticles } from '../../utils/particleAnimation';
import './user.css';

function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [],
    bio: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    fullname: false,
    email: false,
    password: false,
    phone: false,
    bio: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [appear, setAppear] = useState(false);

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

    setAppear(true);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.body.classList.toggle('dark-mode');

    if (canvasRef.current) {
        initParticles(canvasRef.current, newDarkMode);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputFocus = (field, value) => {
    setInputFocus({ ...inputFocus, [field]: value });
  };

  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => {
        setFormData(data);
        if (data.profilePicturePath) {
          setPreviewImage(`http://localhost:8080/uploads/profile/${data.profilePicturePath}`);
        }
      })
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('profilePictureInput').click();
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let isValid = true;

    if (!formData.email) {
      alert("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert("Email is invalid");
      isValid = false;
    }

    if (formData.skills.length < 2) {
      alert("Please add at least two skills.");
      isValid = false;
    }

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        if (profilePicture) {
          const formData = new FormData();
          formData.append('file', profilePicture);
          await fetch(`http://localhost:8080/user/${id}/uploadProfilePicture`, {
            method: 'PUT',
            body: formData,
          });
        }
        alert('Profile updated successfully!');
        navigate('/userProfile');
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${darkMode ? 'dark-mode' : ''}`}>
      <canvas ref={canvasRef} className="particles-background"></canvas>
      <div className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        <span className="theme-toggle-tooltip">{darkMode ? "Light Mode" : "Dark Mode"}</span>
      </div>
      
      <div className={`auth-inner-container centered-form ${appear ? 'appear' : ''}`}>
        <div className="auth-content form-side full-width">
          <div className="login-content">
            <h1 className="auth-heading">Update Your Profile</h1>
            <p className="auth-subheading">Maintain your professional presence</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <div className="profile-preview-wrapper">
                <div 
                  className="profile-preview-container"
                  onClick={triggerFileInput}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Selected Profile"
                      className="profile-preview-image"
                    />
                  ) : (
                    <FaUserCircle className="profile-icon-placeholder" />
                  )}
                </div>
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className={`floating-label-group ${inputFocus.fullname || formData.fullname ? 'active' : ''}`}>
              <input
                type="text"
                name="fullname"
                id="fullname"
                value={formData.fullname || ''}
                onChange={handleInputChange}
                onFocus={() => handleInputFocus('fullname', true)}
                onBlur={() => handleInputFocus('fullname', false)}
                required
                className="auth-input"
              />
              <label htmlFor="fullname" className="floating-label">
                <i className="input-icon fas fa-user"></i>
                Full Name
              </label>
              <span className="input-highlight"></span>
            </div>

            <div className={`floating-label-group ${inputFocus.email || formData.email ? 'active' : ''}`}>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                onFocus={() => handleInputFocus('email', true)}
                onBlur={() => handleInputFocus('email', false)}
                required
                className="auth-input"
              />
              <label htmlFor="email" className="floating-label">
                <i className="input-icon fas fa-envelope"></i>
                Email Address
              </label>
              <span className="input-highlight"></span>
            </div>

            <div className={`floating-label-group ${inputFocus.password || formData.password ? 'active' : ''}`}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                onFocus={() => handleInputFocus('password', true)}
                onBlur={() => handleInputFocus('password', false)}
                required
                className="auth-input"
              />
              <label htmlFor="password" className="floating-label">
                <i className="input-icon fas fa-lock"></i>
                Password
              </label>
              <span className="input-highlight"></span>
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>

            <div className={`floating-label-group ${inputFocus.phone || formData.phone ? 'active' : ''}`}>
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => {
                  const re = /^[0-9\b]{0,10}$/;
                  if (re.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                onFocus={() => handleInputFocus('phone', true)}
                onBlur={() => handleInputFocus('phone', false)}
                maxLength="10"
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits."
                required
                className="auth-input"
              />
              <label htmlFor="phone" className="floating-label">
                <i className="input-icon fas fa-phone"></i>
                Phone
              </label>
              <span className="input-highlight"></span>
            </div>

            <div className="skills-section">
              <label className="skills-label">Skills</label>
              <div className="skills-container">
                {formData.skills && formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      className="skill-remove"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="skill-input-group">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="skill-add-btn"
                >
                  <IoMdAdd />
                </button>
              </div>
            </div>

            <div className={`floating-label-group ${inputFocus.bio || formData.bio ? 'active' : ''}`}>
              <textarea
                name="bio"
                id="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                onFocus={() => handleInputFocus('bio', true)}
                onBlur={() => handleInputFocus('bio', false)}
                required
                className="auth-input"
                rows={3}
              ></textarea>
              <label htmlFor="bio" className="floating-label">
                <i className="input-icon fas fa-info-circle"></i>
                Bio
              </label>
              <span className="input-highlight"></span>
            </div>

            <button type="submit" className={`auth-button ripple-button ${loading ? 'loading' : ''}`} disabled={loading}>
              <span className="button-content">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-edit"></i>
                    <span>Update Profile</span>
                  </>
                )}
              </span>
            </button>

            <p className="Auth_signupPrompt">
              <span onClick={() => navigate('/userProfile')} className="Auth_signupLink">Back to profile</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserProfile;
