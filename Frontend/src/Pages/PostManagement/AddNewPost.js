import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import { initParticles } from '../../utils/particleAnimation';
import './post.css';

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [categories, setCategories] = useState('');
  const userID = localStorage.getItem('userID');
  const [darkMode, setDarkMode] = useState(false);
  const [appear, setAppear] = useState(false);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    title: false,
    description: false,
    category: false,
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

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024;

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categories);
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      const response = await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
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
            <h1 className="auth-heading">Create New Post</h1>
            <p className="auth-subheading">Share your skills and experiences</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`floating-label-group ${inputFocus.title || title ? 'active' : ''}`}>
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => handleInputFocus('title', true)}
                onBlur={() => handleInputFocus('title', false)}
                required
                className="auth-input"
                placeholder=" "
              />
              <label htmlFor="title" className="floating-label">
                <i className="input-icon fas fa-heading"></i>
                Post Title
              </label>
              <span className="input-highlight"></span>
            </div>

            <div className={`floating-label-group ${inputFocus.description || description ? 'active' : ''}`}>
              <textarea
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

            <div className={`floating-label-group ${inputFocus.category || categories ? 'active' : ''}`}>
              <select
                name="category"
                id="category"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
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

            <div className={`floating-label-group ${inputFocus.media ? 'active' : ''}`}>
              <div className="media-upload-section">
                <label className="media-label" htmlFor="media">
                  <i className="fas fa-photo-video"></i>
                  Media Files
                </label>
                <div className="media-preview-container">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="media-preview-item">
                      {preview.type.startsWith('video/') ? (
                        <video controls className="media-preview">
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className="media-preview" src={preview.url} alt={`Preview ${index}`} />
                      )}
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  id="media"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  multiple
                  onChange={handleMediaChange}
                  onFocus={() => handleInputFocus('media', true)}
                  onBlur={() => handleInputFocus('media', false)}
                  className="media-input"
                />
              </div>
            </div>

            <button type="submit" className={`auth-button ripple-button ${loading ? 'loading' : ''}`} disabled={loading}>
              <span className="button-content">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Creating Post...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    <span>Create Post</span>
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

export default AddNewPost;
