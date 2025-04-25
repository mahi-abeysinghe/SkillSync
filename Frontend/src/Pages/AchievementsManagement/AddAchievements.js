import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import { initParticles } from '../../utils/particleAnimation';
import '../PostManagement/post.css';

function AddAchievements() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    postOwnerID: '',
    category: '',
    postOwnerName: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [appear, setAppear] = useState(false);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    title: false,
    description: false,
    category: false,
    date: false,
    image: false
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

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

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
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

  const handleInputFocus = (field, value) => {
    setInputFocus({ ...inputFocus, [field]: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
          method: 'POST',
          body: formData,
        });
        imageUrl = await uploadResponse.text();
      }

      const response = await fetch('http://localhost:8080/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrl }),
      });
      if (response.ok) {
        alert('Achievement added successfully!');
        window.location.href = '/myAchievements';
      } else {
        alert('Failed to add Achievement.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add Achievement.');
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
      <NavBar />
      
      <div className={`auth-inner-container centered-form ${appear ? 'appear' : ''}`}>
        <div className="auth-content form-side full-width">
          <div className="login-content">
            <h1 className="auth-heading">Add Achievement</h1>
            <p className="auth-subheading">Share your accomplishments</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`floating-label-group ${inputFocus.image ? 'active' : ''}`}>
              <div className="media-upload-section">
                <label className="media-label" htmlFor="image">
                  <i className="fas fa-image"></i>
                  Achievement Image
                </label>
                {imagePreview && (
                  <div className="media-preview-container">
                    <div className="media-preview-item">
                      <img className="media-preview" src={imagePreview} alt="Achievement Preview" />
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  onFocus={() => handleInputFocus('image', true)}
                  onBlur={() => handleInputFocus('image', false)}
                  className="media-input"
                  required
                />
              </div>
            </div>

            <div className={`floating-label-group ${inputFocus.title || formData.title ? 'active' : ''}`}>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                onFocus={() => handleInputFocus('title', true)}
                onBlur={() => handleInputFocus('title', false)}
                required
                className="auth-input"
                placeholder=" "
              />
              <label htmlFor="title" className="floating-label">
                <i className="input-icon fas fa-trophy"></i>
                Achievement Title
              </label>
              <span className="input-highlight"></span>
            </div>

            <div className={`floating-label-group ${inputFocus.description || formData.description ? 'active' : ''}`}>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                onFocus={() => handleInputFocus('description', true)}
                onBlur={() => handleInputFocus('description', false)}
                required
                className="auth-input"
                rows={3}
                placeholder=" "
              ></textarea>
              <label htmlFor="description" className="floating-label">
                <i className="input-icon fas fa-pen"></i>
                Description
              </label>
              <span className="input-highlight"></span>
            </div>

            <div className={`floating-label-group ${inputFocus.category || formData.category ? 'active' : ''}`}>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                onFocus={() => handleInputFocus('category', true)}
                onBlur={() => handleInputFocus('category', false)}
                required
                className="auth-input"
              >
                <option value="" disabled></option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
              <label htmlFor="category" className="floating-label">
                <i className="input-icon fas fa-tag"></i>
                Category
              </label>
              <span className="input-highlight"></span>
            </div>

            <div className={`floating-label-group ${inputFocus.date || formData.date ? 'active' : ''}`}>
              <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                onFocus={() => handleInputFocus('date', true)}
                onBlur={() => handleInputFocus('date', false)}
                required
                className="auth-input"
              />
              <label htmlFor="date" className="floating-label">
                <i className="input-icon fas fa-calendar"></i>
                Achievement Date
              </label>
              <span className="input-highlight"></span>
            </div>

            <button type="submit" className={`auth-button ripple-button ${loading ? 'loading' : ''}`} disabled={loading}>
              <span className="button-content">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Adding Achievement...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-medal"></i>
                    <span>Add Achievement</span>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddAchievements;
