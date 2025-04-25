import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import { initParticles } from '../../utils/particleAnimation';
import './achievements.css';

function UpdateAchievements() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [appear, setAppear] = useState(false);
  const canvasRef = useRef(null);
  const [inputFocus, setInputFocus] = useState({
    title: false,
    description: false,
    category: false,
    date: false,
    media: false
  });

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
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch achievement');
        }
        const data = await response.json();
        setFormData(data);
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8080/achievements/images/${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching Achievements data:', error);
        alert('Error loading achievement data');
      }
    };
    fetchAchievement();
  }, [id]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8080/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('Achievement updated successfully!');
        window.location.href = '/allAchievements';
      } else {
        throw new Error('Failed to update achievement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
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
            <h1 className="auth-heading">Update Achievement</h1>
            <p className="auth-subheading">Edit your achievement details</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`floating-label-group ${inputFocus.title || formData.title ? 'active' : ''}`}>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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

            <div className={`floating-label-group ${inputFocus.media ? 'active' : ''}`}>
              <div className="media-upload-section">
                <label className="media-label">
                  <i className="fas fa-image"></i>
                  Achievement Image
                </label>
                <div className="media-preview-container">
                  {previewImage && (
                    <div className="media-preview-item">
                      <img className="media-preview" src={previewImage} alt="Achievement Preview" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="media"
                  accept="image/*"
                  onChange={handleFileChange}
                  onFocus={() => handleInputFocus('media', true)}
                  onBlur={() => handleInputFocus('media', false)}
                  className="media-input"
                />
              </div>
            </div>

            <button type="submit" className={`auth-button ripple-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              <span className="button-content">
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Updating Achievement...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    <span>Update Achievement</span>
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

export default UpdateAchievements;