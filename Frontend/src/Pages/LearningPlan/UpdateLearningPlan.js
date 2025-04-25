import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css';
import './AddLearningPlan.css';
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import { FaVideo, FaImage } from "react-icons/fa";
import { initParticles } from '../../utils/particleAnimation';

function UpdateLearningPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [appear, setAppear] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef(null);
  const [inputFocus, setInputFocus] = useState({
    title: false,
    description: false,
    category: false,
    tags: false,
    startDate: false,
    endDate: false,
    contentURL: false
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
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningPlan/${id}`);
        const { title, description, contentURL, tags, imageUrl, templateID, startDate, endDate, category } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL);
        setTags(tags);
        setExistingImage(imageUrl);
        setTemplateID(templateID);
        setStartDate(startDate);
        setEndDate(endDate);
        setCategory(category);
        
        // Set initial states for media inputs based on existing content
        if (contentURL) setShowContentURLInput(true);
        if (imageUrl) setShowImageUploadInput(true);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
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

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTemplateSelect = (id) => {
    setTemplateID(Number(id));
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      // Add support for Vimeo links
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1];
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }
    
    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    let imageUrl = existingImage;

    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
        setIsSubmitting(false);
        return;
      }
    }

    const updatedPost = { title, description, contentURL, tags, imageUrl, postOwnerID: localStorage.getItem('userID'), templateID, startDate, endDate, category };
    try {
      await axios.put(`http://localhost:8080/learningPlan/${id}`, updatedPost);
      alert('Post updated successfully!');
      window.location.href = '/allLearningPlan';
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    } finally {
      setIsSubmitting(false);
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
      <div className={`auth-inner-container ${appear ? 'appear' : ''}`}>
        <div className="template-section">
          <div className="template-header">
            <h2 className="section-heading">Choose Your Template Style</h2>
            <p className="section-subheading">Click to select a template for your learning plan</p>
          </div>
          
          <div className="template-cards">
            <div 
              className={`template-card ${templateID === 1 ? 'active' : ''}`}
              onClick={() => handleTemplateSelect('1')}
            >
              <div className="card-header">
                <h3>Classic Layout</h3>
                <span className="template-number">1</span>
              </div>
              <div className="template-preview template-1">
                <div className="preview-content">
                  <h4 className="preview-title">{title || 'Your Title'}</h4>
                  <div className="date-badge">
                    <HiCalendarDateRange />
                    <span>{startDate || '2024-01-01'} to {endDate || '2024-12-31'}</span>
                  </div>
                  <div className="category-badge">{category || 'Category'}</div>
                  <p className="description-preview">{description || 'Your description will appear here...'}</p>
                  <div className="tags-preview">
                    {tags.length > 0 ? tags.map((tag, index) => (
                      <span key={index} className="preview-tag">#{tag}</span>
                    )) : (
                      <>
                        <span className="preview-tag">#sample</span>
                        <span className="preview-tag">#tags</span>
                      </>
                    )}
                  </div>
                  <div className="media-preview-container">
                    {imagePreview || contentURL || existingImage ? (
                      <div className="media-content">
                        {imagePreview && <img src={imagePreview} alt="Preview" className="preview-media" />}
                        {!imagePreview && existingImage && (
                          <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="preview-media" />
                        )}
                        {contentURL && (
                          <div className="video-container">
                            <iframe src={getEmbedURL(contentURL)} title="Content" frameBorder="0" allowFullScreen className="preview-video" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="placeholder-media">
                        <i className="fas fa-photo-video"></i>
                        <span>Media Content</span>
                      </div>
                    )}
                  </div>
                </div>
                {templateID === 1 && <div className="selected-indicator"><i className="fas fa-check-circle"></i> Selected</div>}
              </div>
            </div>

            <div 
              className={`template-card ${templateID === 2 ? 'active' : ''}`}
              onClick={() => handleTemplateSelect('2')}
            >
              <div className="card-header">
                <h3>Split View</h3>
                <span className="template-number">2</span>
              </div>
              <div className="template-preview template-2">
                <div className="split-layout">
                  <div className="media-section">
                    {(imagePreview || existingImage || contentURL) ? (
                      <>
                        {imagePreview && <img src={imagePreview} alt="Preview" className="preview-media" />}
                        {!imagePreview && existingImage && (
                          <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="preview-media" />
                        )}
                        {contentURL && (
                          <div className="video-container">
                            <iframe src={getEmbedURL(contentURL)} title="Content" frameBorder="0" allowFullScreen className="preview-video" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="placeholder-media">
                        <i className="fas fa-photo-video"></i>
                        <span>Media Section</span>
                      </div>
                    )}
                  </div>
                  <div className="content-section">
                    <h4 className="preview-title">{title || 'Your Title'}</h4>
                    <div className="date-badge">
                      <HiCalendarDateRange />
                      <span>{startDate || '2024-01-01'} to {endDate || '2024-12-31'}</span>
                    </div>
                    <p className="description-preview">{description || 'Description preview...'}</p>
                    <div className="tags-preview">
                      {tags.length > 0 ? tags.map((tag, index) => (
                        <span key={index} className="preview-tag">#{tag}</span>
                      )) : (
                        <>
                          <span className="preview-tag">#sample</span>
                          <span className="preview-tag">#tags</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {templateID === 2 && <div className="selected-indicator"><i className="fas fa-check-circle"></i> Selected</div>}
              </div>
            </div>

            <div 
              className={`template-card ${templateID === 3 ? 'active' : ''}`}
              onClick={() => handleTemplateSelect('3')}
            >
              <div className="card-header">
                <h3>Modern Stack</h3>
                <span className="template-number">3</span>
              </div>
              <div className="template-preview template-3">
                <div className="modern-stack">
                  <div className="hero-section">
                    {(imagePreview || existingImage || contentURL) ? (
                      <div className="media-content">
                        {imagePreview && <img src={imagePreview} alt="Preview" className="preview-media" />}
                        {!imagePreview && existingImage && (
                          <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="preview-media" />
                        )}
                        {contentURL && (
                          <div className="video-container">
                            <iframe src={getEmbedURL(contentURL)} title="Content" frameBorder="0" allowFullScreen className="preview-video" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="placeholder-media">
                        <i className="fas fa-photo-video"></i>
                        <span>Featured Media</span>
                      </div>
                    )}
                    <div className="overlay-content">
                      <h4 className="preview-title">{title || 'Your Title'}</h4>
                      <div className="meta-info">
                        <span className="category-badge">{category || 'Category'}</span>
                        <div className="date-badge">
                          <HiCalendarDateRange />
                          <span>{startDate || 'Start'} - {endDate || 'End'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="details-section">
                    <p className="description-preview">{description || 'Description preview...'}</p>
                    <div className="tags-preview">
                      {tags.length > 0 ? tags.map((tag, index) => (
                        <span key={index} className="preview-tag">#{tag}</span>
                      )) : (
                        <>
                          <span className="preview-tag">#sample</span>
                          <span className="preview-tag">#tags</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {templateID === 3 && <div className="selected-indicator"><i className="fas fa-check-circle"></i> Selected</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="auth-content form-side">
            <div className="login-content">
              <h1 className="auth-heading">Update Learning Plan</h1>
              <p className="auth-subheading">Edit your learning journey</p>
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
                  Plan Title
                </label>
                <span className="input-highlight"></span>
              </div>

              <div className="tags-section">
                <div className="tags-header">
                  <span>Edit Tags</span>
                  <small>Press Enter or click + to add</small>
                </div>
                <div className="tags-container">
                  <div className="tags-display">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                        <button 
                          type="button" 
                          onClick={() => handleDeleteTag(index)}
                          className="remove-tag"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className={`floating-label-group tag-input-group ${inputFocus.tags || tagInput ? 'active' : ''}`}>
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onFocus={() => handleInputFocus('tags', true)}
                      onBlur={() => handleInputFocus('tags', false)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="auth-input"
                      placeholder="Type a tag..."
                    />
                    <button type="button" onClick={handleAddTag} className="add-tag-btn">
                      <IoMdAdd />
                    </button>
                  </div>
                </div>
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
                  placeholder=" "
                  rows={4}
                />
                <label htmlFor="description" className="floating-label">
                  <i className="input-icon fas fa-align-left"></i>
                  Description
                </label>
              </div>

              <div className={`floating-label-group category-select-group ${inputFocus.category || category ? 'active' : ''}`}>
                <select
                  name="category"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onFocus={() => handleInputFocus('category', true)}
                  onBlur={() => handleInputFocus('category', false)}
                  required
                  className="auth-input custom-select"
                >
                  <option value="" disabled>Choose a category</option>
                  <option value="Tech">💻 Tech</option>
                  <option value="Programming">⌨️ Programming</option>
                  <option value="Cooking">🍳 Cooking</option>
                  <option value="Photography">📸 Photography</option>
                  <option value="Art">🎨 Art</option>
                  <option value="Music">🎵 Music</option>
                  <option value="Language">🗣️ Language</option>
                  <option value="Business">💼 Business</option>
                </select>
                <label htmlFor="category" className="floating-label category-label">
                  <i className="input-icon fas fa-list"></i>
                  Select Category
                </label>
                <div className="select-arrow">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>

              <div className={`floating-label-group ${inputFocus.startDate || startDate ? 'active' : ''}`}>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onFocus={() => handleInputFocus('startDate', true)}
                  onBlur={() => handleInputFocus('startDate', false)}
                  required
                  className="auth-input"
                  placeholder=" "
                />
                <label htmlFor="startDate" className="floating-label">
                  <i className="input-icon fas fa-calendar-alt"></i>
                  Start Date
                </label>
              </div>

              <div className={`floating-label-group ${inputFocus.endDate || endDate ? 'active' : ''}`}>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onFocus={() => handleInputFocus('endDate', true)}
                  onBlur={() => handleInputFocus('endDate', false)}
                  required
                  className="auth-input"
                  placeholder=" "
                />
                <label htmlFor="endDate" className="floating-label">
                  <i className="input-icon fas fa-calendar-alt"></i>
                  End Date
                </label>
              </div>

              <div className="media-section">
                <div className="media-controls">
                  <button 
                    type="button" 
                    className={`media-btn ${showContentURLInput ? 'active' : ''}`}
                    onClick={() => setShowContentURLInput(!showContentURLInput)}
                  >
                    <FaVideo /> 
                    <span>Add Video URL</span>
                  </button>
                  <button 
                    type="button" 
                    className={`media-btn ${showImageUploadInput ? 'active' : ''}`}
                    onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                  >
                    <FaImage /> 
                    <span>Add Image</span>
                  </button>
                </div>

                {showContentURLInput && (
                  <div className={`floating-label-group video-url-group ${inputFocus.contentURL || contentURL ? 'active' : ''}`}>
                    <input
                      type="url"
                      name="contentURL"
                      id="contentURL"
                      value={contentURL}
                      onChange={(e) => setContentURL(e.target.value)}
                      onFocus={() => handleInputFocus('contentURL', true)}
                      onBlur={() => handleInputFocus('contentURL', false)}
                      className="auth-input"
                      placeholder="Enter YouTube or video URL"
                    />
                    <label htmlFor="contentURL" className="floating-label">
                      <i className="input-icon fas fa-link"></i>
                      Video URL
                    </label>
                  </div>
                )}

                {showImageUploadInput && (
                  <div className="image-upload-container">
                    <div className="image-upload-box">
                      {imagePreview ? (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                          <button type="button" onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                          }} className="remove-image">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : existingImage ? (
                        <div className="image-preview">
                          <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" />
                          <button type="button" onClick={() => {
                            setExistingImage('');
                          }} className="remove-image">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <FaImage />
                          <span>Click to upload image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className={`auth-button ripple-button ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                <span className="button-content">
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      <span>Updating Plan...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      <span>Update Learning Plan</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateLearningPost;
