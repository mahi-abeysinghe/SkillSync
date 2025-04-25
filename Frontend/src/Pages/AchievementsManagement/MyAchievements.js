import React, { useEffect, useState } from 'react';
import { FaEdit, FaSearch } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar'
import { IoIosCreate } from "react-icons/io";
import Modal from 'react-modal';

Modal.setAppElement('#root');

function MyAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((achievement) => achievement.postOwnerID === userId);
        setProgressData(userFilteredData);
        setFilteredData(userFilteredData);
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Achievements?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievements deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Achievements.');
        }
      } catch (error) {
        console.error('Error deleting Achievements:', error);
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = progressData.filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const openModal = (imageUrl) => {
    setSelectedMedia(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className='continer'>
        <NavBar />
        <div className='continSection'>
          <div className='search-container'>
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search achievements by title or description"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className='add_new_btn' onClick={() => (window.location.href = '/addAchievements')}>
            <IoIosCreate className='add_new_btn_icon' />
          </div>
          <div className='post_card_continer'>
            {filteredData.length === 0 ? (
              <div className='not_found_box'>
                <div className='not_found_img'></div>
                <p className='not_found_msg'>No achievements found. Please create a new achievement.</p>
                <button className='not_found_btn' onClick={() => (window.location.href = '/addAchievements')}>
                  Create New Achievement
                </button>
              </div>
            ) : (
              filteredData.map((progress) => (
                <div key={progress.id} className='post_card'>
                  <div className='user_details_card'>
                    <div className='name_section_post'>
                      <p className='name_section_post_owner_name'>{progress.postOwnerName}</p>
                      <p className='date_card_dte'>{progress.date}</p>
                    </div>
                    {progress.postOwnerID === userId && (
                      <div>
                        <div className='action_btn_icon_post'>
                          <FaEdit
                            onClick={() => (window.location.href = `/updateAchievements/${progress.id}`)}
                            className='action_btn_icon'
                          />
                          <RiDeleteBin6Fill
                            onClick={() => handleDelete(progress.id)}
                            className='action_btn_icon'
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className='user_details_card_di'>
                    <p className='card_post_title'>{progress.title}</p>
                    <p className='card_post_description' style={{ whiteSpace: "pre-line" }}>{progress.description}</p>
                  </div>
                  {progress.imageUrl && (
                    <div className="media-collage">
                      <div className='media-item' onClick={() => openModal(`http://localhost:8080/achievements/images/${progress.imageUrl}`)}>
                        <img
                          src={`http://localhost:8080/achievements/images/${progress.imageUrl}`}
                          alt="Achievement"
                          className='media_file_se'
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <button className="close-modal-btn" onClick={closeModal}>x</button>
        {selectedMedia && (
          <img src={selectedMedia} alt="Full Media" className="modal-media" />
        )}
      </Modal>
    </div>
  );
}

export default MyAchievements;
