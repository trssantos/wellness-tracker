import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Trash, Plus, X } from 'lucide-react';

const RetroTapePlayer = ({ isMuted }) => {
  // Core player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  
  // UI states
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMixtapeIndex, setSelectedMixtapeIndex] = useState(null);
  
  // Animation states
  const [isInserted, setIsInserted] = useState(false);
  const [isEjecting, setIsEjecting] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  
  // Form states
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackName, setNewTrackName] = useState('');
  const [playerError, setPlayerError] = useState(null);
  
  // YouTube player states
  const [youtubeId, setYoutubeId] = useState('');
  
  // Refs
  const playlistRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const playerContainerRef = useRef(null);
  
  // Sound effect refs
  const insertSound = useRef(new Audio('/audio/tape.wav'));
  const ejectSound = useRef(new Audio('/audio/tape.wav'));
  const clickSound = useRef(new Audio('/audio/tape.wav'));
  
  // Load default playlist or from localStorage
  const [playlist, setPlaylist] = useState(() => {
    const savedPlaylist = localStorage.getItem('workout-playlist');
    return savedPlaylist ? JSON.parse(savedPlaylist) : [
      { name: "1987 Neo-Tokyo | Synthwave, Retrowave, Vaporwave Mix", url: "https://www.youtube.com/watch?v=FaWLDozIylU" },
      { name: "Synthwave Cardio", url: "https://www.youtube.com/watch?v=n8X9_MgEdCg" },
      { name: "80s Workout Pop Hits", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
    ];
  });

  // Load YouTube API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API ready");
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // Handle clicks outside the playlist modal
  useEffect(() => {
    if (!showPlaylistModal) return;
    
    const handleClickOutside = (event) => {
      if (
        playlistRef.current && 
        !playlistRef.current.contains(event.target) &&
        !event.target.classList.contains('eject-button-mixtape')
      ) {
        setShowPlaylistModal(false);
        setSelectedMixtapeIndex(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlaylistModal]);

  // Initialize or update YouTube player when track changes
  useEffect(() => {
    if (!isInserted || playlist.length === 0) return;
    
    if (currentTrack >= playlist.length) {
      setCurrentTrack(0);
      return;
    }
    
    const url = playlist[currentTrack].url;
    let id = extractYouTubeId(url);
    
    setYoutubeId(id);
    
    // Only initialize YouTube player if we have an ID and the API is loaded
    if (id && window.YT && window.YT.Player) {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
      
      youtubePlayerRef.current = new window.YT.Player('youtube-player-mixtape', {
        height: '0',
        width: '0',
        videoId: id,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0
        },
        events: {
          onReady: (event) => {
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNextTrack();
            }
          },
          onError: (event) => {
            console.error("YouTube player error:", event.data);
            setPlayerError(`Error playing video (${event.data})`);
          }
        }
      });
    }
  }, [currentTrack, isInserted]);

  // Update player state when play/pause or mute changes
  useEffect(() => {
    if (!isInserted || !youtubePlayerRef.current) return;
    
    if (youtubePlayerRef.current.getPlayerState) {
      const playerState = youtubePlayerRef.current.getPlayerState();
      
      if (isPlaying && playerState !== 1) {
        youtubePlayerRef.current.playVideo();
      } else if (!isPlaying && playerState === 1) {
        youtubePlayerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isInserted]);

  // Handle mute changes
  useEffect(() => {
    if (!youtubePlayerRef.current) return;
    
    if (youtubePlayerRef.current.mute && youtubePlayerRef.current.unMute) {
      if (isMuted) {
        youtubePlayerRef.current.mute();
      } else {
        youtubePlayerRef.current.unMute();
      }
    }
  }, [isMuted]);

  // Save playlist to localStorage
  useEffect(() => {
    localStorage.setItem('workout-playlist', JSON.stringify(playlist));
  }, [playlist]);

  // Handle ejection animation completion
  useEffect(() => {
    if (!isEjecting) return;
    
    const timer = setTimeout(() => {
      setIsEjecting(false);
      setIsInserted(false);
      
      // Reset errors
      if (playerError) {
        setPlayerError(null);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isEjecting]);

  // Handle insertion animation completion
  useEffect(() => {
    if (!isInserting) return;
    
    const timer = setTimeout(() => {
      setIsInserting(false);
      setIsInserted(true);
      setShowPlaylistModal(false);
      
      // Reset errors and auto-play
      if (playerError) {
        setPlayerError(null);
      }
      
      setIsPlaying(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isInserting]);

  // Extract YouTube ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return '';
    
    let id = '';
    
    try {
      if (url.includes('youtu.be/')) {
        id = url.split('youtu.be/')[1];
      } else if (url.includes('youtube.com/watch?v=')) {
        id = url.split('v=')[1];
      }
      
      // Remove any additional parameters
      const ampersandPosition = id.indexOf('&');
      if (ampersandPosition !== -1) {
        id = id.substring(0, ampersandPosition);
      }
      
      return id;
    } catch (err) {
      console.error("Error extracting YouTube ID:", err);
      return '';
    }
  };

  // Play sound effect if not muted
  const playSound = (sound) => {
    if (isMuted || !sound.current) return;
    
    sound.current.currentTime = 0;
    sound.current.play().catch(err => console.log('Audio error:', err));
  };

  // Insert button handler - now opens modal or ejects tape
  const handleInsertButton = () => {
    if (isInserted) {
      // If a tape is already inserted, eject it first
      ejectTape();
      return;
    }
    
    // Show playlist modal
    setShowPlaylistModal(true);
    setSelectedMixtapeIndex(null);
    playSound(clickSound);
  };

  // Handle mixtape selection
  const handleMixtapeSelect = (index) => {
    setSelectedMixtapeIndex(index);
  };

  // Insert the selected tape
  const insertSelectedTape = () => {
    if (selectedMixtapeIndex === null) return;
    
    setCurrentTrack(selectedMixtapeIndex);
    setIsInserting(true);
    playSound(insertSound);
    setShowPlaylistModal(false);
  };

  // Eject the current tape
  const ejectTape = () => {
    // Stop playback
    setIsPlaying(false);
    
    // Stop YouTube player
    if (youtubePlayerRef.current && youtubePlayerRef.current.stopVideo) {
      youtubePlayerRef.current.stopVideo();
    }
    
    // Start ejection animation
    setIsEjecting(true);
    playSound(ejectSound);
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!isInserted) return;
    setIsPlaying(prev => !prev);
  };

  // Go to previous track with proper animation sequence
  const handlePrevTrack = () => {
    if (!isInserted || playlist.length <= 1) return;
    
    playSound(clickSound);
    
    // Calculate the new track index
    const newIndex = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
    
    // Start track change sequence
    handleTrackChange(newIndex);
  };

  // Go to next track with proper animation sequence
  const handleNextTrack = () => {
    if (!isInserted || playlist.length <= 1) return;
    
    playSound(clickSound);
    
    // Calculate the new track index
    const newIndex = (currentTrack + 1) % playlist.length;
    
    // Start track change sequence
    handleTrackChange(newIndex);
  };
  
  // Handle track change sequence: eject -> change track -> insert
  const handleTrackChange = (newIndex) => {
    // Stop playback
    setIsPlaying(false);
    
    // Stop YouTube player if it exists
    if (youtubePlayerRef.current && youtubePlayerRef.current.stopVideo) {
      youtubePlayerRef.current.stopVideo();
    }
    
    // Start ejection animation
    setIsEjecting(true);
    playSound(ejectSound);
    
    // After ejection is complete, change track and start insertion
    setTimeout(() => {
      setCurrentTrack(newIndex);
      setIsInserted(false);
      
      // Small delay before starting insertion
      setTimeout(() => {
        setIsInserting(true);
        playSound(insertSound);
      }, 300);
    }, 1000);
  };

  // Open the modal to add a new mixtape
  const openAddMixtapeModal = () => {
    setShowAddModal(true);
    playSound(clickSound);
  };

  // Close the modal
  const closeAddMixtapeModal = () => {
    setShowAddModal(false);
    setNewTrackName('');
    setNewTrackUrl('');
    playSound(clickSound);
  };

  // Add track to playlist
  const addTrack = () => {
    if (!newTrackUrl) return;
    
    playSound(clickSound);
    
    // Validate the URL is a YouTube link
    const youtubeId = extractYouTubeId(newTrackUrl);
    if (!youtubeId) {
      setPlayerError("Invalid YouTube URL");
      return;
    }
    
    // Add to playlist
    const trackName = newTrackName || `Track ${playlist.length + 1}`;
    setPlaylist(prev => [...prev, { name: trackName, url: newTrackUrl }]);
    
    // Reset form and close modal
    setNewTrackUrl('');
    setNewTrackName('');
    setShowAddModal(false);
  };

  // Remove track from playlist
  const removeTrack = (index, e) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    playSound(clickSound);
    
    // If removing the currently inserted track, eject it first
    if (isInserted && currentTrack === index) {
      ejectTape();
    }
    
    setPlaylist(prev => {
      const newPlaylist = [...prev];
      newPlaylist.splice(index, 1);
      return newPlaylist;
    });
    
    // Adjust current track index if needed
    if (currentTrack >= index && currentTrack > 0) {
      setCurrentTrack(prev => prev - 1);
    }
    
    // Reset selection if the selected tape was deleted
    if (selectedMixtapeIndex === index) {
      setSelectedMixtapeIndex(null);
    } else if (selectedMixtapeIndex > index) {
      setSelectedMixtapeIndex(prev => prev - 1);
    }
  };

  // Get current track data
  const getCurrentTrack = () => {
    if (playlist.length === 0 || currentTrack >= playlist.length) return null;
    return playlist[currentTrack];
  };

  return (
    <div className="vintage-player-mixtape" ref={playerContainerRef}>
      {/* Cassette UI */}
      <div className="cassette-container-mixtape">
        <div className="radio-tuner-mixtape">
          <div className="tuner-line-mixtape"></div>
          <div className="frequency-scale-mixtape">
            <span>88</span>
            <span>92</span>
            <span>96</span>
            <span>100</span>
            <span>104</span>
            <span>108</span>
            <span>MHz</span>
          </div>
          <div className="tuner-indicator-mixtape"></div>
        </div>
        
        <div className="cassette-window-mixtape">
          {/* Cassette visualization */}
          {(isInserted || isInserting || isEjecting) && (
            <div className={`cassette-mixtape ${isEjecting ? 'ejecting-mixtape' : isInserting ? 'inserting-mixtape' : 'inserted-mixtape'}`}>
              <div className="cassette-body-mixtape">
                <div className="cassette-inner-mixtape">
                  <div className="cassette-reel-mixtape left-reel-mixtape">
                    <div className={`reel-spokes-mixtape ${isPlaying ? 'spinning-mixtape' : ''}`}></div>
                  </div>
                  <div className="cassette-reel-mixtape right-reel-mixtape">
                    <div className={`reel-spokes-mixtape ${isPlaying ? 'spinning-mixtape' : ''}`}></div>
                  </div>
                </div>
                <div className="cassette-label-mixtape">
                  <div className="label-content-mixtape">
                    {getCurrentTrack()?.name || 'Workout Mix'}
                  </div>
                </div>
                <div className="cassette-window-film-mixtape">
                  <div className={`film-mixtape ${isPlaying ? 'moving-mixtape' : ''}`}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Insert/Eject button */}
          <button 
            onClick={handleInsertButton}
            className="eject-button-mixtape"
            disabled={isEjecting || isInserting}
          >
            {isInserted ? 'EJECT' : 'INSERT'}
          </button>
        </div>
        
        {/* Track display */}
        <div className="track-display-mixtape">
          <span className="track-label-mixtape">
            {playlist.length > 0 
              ? `TRACK ${currentTrack + 1}/${playlist.length}` 
              : 'NO TRACKS'}
          </span>
          <div className="playing-indicator-mixtape">{isPlaying && <span className="blink-mixtape">►</span>}</div>
        </div>
        
        {/* Player controls */}
        <div className="player-controls-mixtape">
          <button 
            onClick={handlePrevTrack}
            disabled={!isInserted || playlist.length <= 1}
            className="control-button-mixtape prev-button-mixtape"
          >
            <SkipBack size={18} />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!isInserted || playlist.length === 0}
            className={`control-button-mixtape play-button-mixtape ${isPlaying ? 'active-mixtape' : ''}`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <button 
            onClick={handleNextTrack}
            disabled={!isInserted || playlist.length <= 1}
            className="control-button-mixtape next-button-mixtape"
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        {playerError && (
          <div className="player-error-mixtape">Error: {playerError}</div>
        )}
        
        <div className="mobile-note-mixtape">
          Note: On mobile devices, you may need to press pause and play when skipping tracks.
        </div>
      </div>
      
      {/* Playlist Selection Modal */}
      {showPlaylistModal && (
        <div className="modal-overlay-mixtape">
          <div className="modal-content-mixtape playlist-modal-mixtape">
            <div className="modal-header-mixtape">
              <h3>Select Mixtape</h3>
              <button className="modal-close-mixtape" onClick={() => setShowPlaylistModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body-mixtape">
              <p className="playlist-instruction-mixtape">Choose a mixtape, then press INSERT</p>
              
              <div className="playlist-container-modal-mixtape">
                {playlist.length === 0 ? (
                  <div className="empty-playlist-mixtape">No mixtapes available</div>
                ) : (
                  playlist.map((tape, index) => (
                    <div 
                      key={index} 
                      className={`playlist-item-mixtape ${selectedMixtapeIndex === index ? 'selected-mixtape' : ''}`}
                      onClick={() => handleMixtapeSelect(index)}
                    >
                      <div className="playlist-item-name-mixtape">{tape.name}</div>
                      <button 
                        className="delete-btn-mixtape" 
                        onClick={(e) => removeTrack(index, e)}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="modal-footer-mixtape">
              <button 
                onClick={openAddMixtapeModal}
                className="new-mixtape-btn-mixtape"
              >
                <Plus size={14} />
                <span>Create a new mixtape</span>
              </button>
              
              <button 
                onClick={insertSelectedTape}
                disabled={selectedMixtapeIndex === null}
                className="modal-insert-btn-mixtape"
              >
                Insert Mixtape
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New Mixtape Modal */}
      {showAddModal && (
        <div className="modal-overlay-mixtape">
          <div className="modal-content-mixtape">
            <div className="modal-header-mixtape">
              <h3>Add New Mixtape</h3>
              <button className="modal-close-mixtape" onClick={closeAddMixtapeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body-mixtape">
              <div className="modal-form-mixtape">
                <div className="form-group-mixtape">
                  <label>Mixtape Name</label>
                  <input
                    type="text"
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    placeholder="Enter a name for your mixtape"
                    className="form-input-mixtape"
                  />
                </div>
                <div className="form-group-mixtape">
                  <label>YouTube URL</label>
                  <input
                    type="text"
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    placeholder="Enter a YouTube video URL"
                    className="form-input-mixtape"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer-mixtape">
              <button 
                onClick={addTrack}
                disabled={!newTrackUrl}
                className="modal-add-btn-mixtape"
              >
                Add Mixtape
              </button>
              <button 
                onClick={closeAddMixtapeModal}
                className="modal-cancel-btn-mixtape"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden YouTube player div */}
      <div id="youtube-player-mixtape" style={{ display: 'none' }}></div>
    </div>
  );
};

// Add vintage player styles
const style = document.createElement('style');
style.innerHTML = `
  /* Vintage Cassette Player Styling */
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  
  .vintage-player-mixtape {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    font-family: 'VT323', monospace;
    position: relative;
  }
  
  .cassette-container-mixtape {
    background: #F5EAD5;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
  }
  
  /* Radio tuner */
  .radio-tuner-mixtape {
    height: 30px;
    background: #E5D8B9;
    border-radius: 15px;
    margin-bottom: 15px;
    position: relative;
    border: 2px solid #C9B690;
  }
  
  .tuner-line-mixtape {
    position: absolute;
    top: 50%;
    left: 10px;
    right: 10px;
    height: 2px;
    background: #C9B690;
    transform: translateY(-50%);
  }
  
  .frequency-scale-mixtape {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    position: relative;
    z-index: 1;
    font-size: 12px;
    color: #8A7B59;
  }
  
  .tuner-indicator-mixtape {
    position: absolute;
    top: 3px;
    left: 50%;
    width: 2px;
    height: calc(100% - 6px);
    background: #C13628;
    transform: translateX(-50%);
    border-radius: 1px;
  }
  
  /* Cassette window */
  .cassette-window-mixtape {
    background: #E5D8B9;
    border-radius: 8px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    border: 2px solid #C9B690;
    margin-bottom: 15px;
  }
  
  /* Cassette */
  .cassette-mixtape {
    width: 80%;
    height: 75%;
    background: black;
    border-radius: 8px;
    position: relative;
  }
  
  .cassette-mixtape.inserted-mixtape {
    transform: translateY(0);
  }
  
  .cassette-mixtape.ejecting-mixtape {
    animation: ejectAnimation-mixtape 1s ease-in-out forwards;
  }
  
  .cassette-mixtape.inserting-mixtape {
    animation: insertAnimation-mixtape 1s ease-in-out forwards;
  }
  
  @keyframes ejectAnimation-mixtape {
    0% { transform: translateY(0); }
    100% { transform: translateY(-150%); }
  }
  
  @keyframes insertAnimation-mixtape {
    0% { transform: translateY(-150%); }
    100% { transform: translateY(0); }
  }
  
  .cassette-body-mixtape {
    width: 100%;
    height: 100%;
    padding: 10px;
    position: relative;
  }
  
  .cassette-inner-mixtape {
    display: flex;
    justify-content: space-between;
    height: 50%;
    margin-bottom: 5px;
  }
  
  .cassette-reel-mixtape {
    width: 40px;
    height: 40px;
    background: #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .reel-spokes-mixtape {
    width: 80%;
    height: 80%;
    border-radius: 50%;
    background: #555;
    position: relative;
  }
  
  .reel-spokes-mixtape::before, .reel-spokes-mixtape::after {
    content: '';
    position: absolute;
    background: #333;
  }
  
  .reel-spokes-mixtape::before {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    transform: translateX(-50%);
  }
  
  .reel-spokes-mixtape::after {
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    transform: translateY(-50%);
  }
  
  .reel-spokes-mixtape.spinning-mixtape {
    animation: spinReel-mixtape 2s linear infinite;
  }
  
  @keyframes spinReel-mixtape {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .cassette-label-mixtape {
    height: 30%;
    background: linear-gradient(90deg, #FF5F6D, #FFC371, #FFE066, #4ECDC4, #88D3FF);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
    position: relative;
    overflow: hidden;
    border: 1px solid white;
  }
  
  .label-content-mixtape {
    background: white;
    padding: 2px 8px;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    max-width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: black;
  }
  
  .cassette-window-film-mixtape {
    height: 20%;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }
  
  .film-mixtape {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(100, 100, 100, 0.5);
    transform: translateY(-50%);
  }
  
  .film-mixtape.moving-mixtape {
    background: linear-gradient(90deg, 
      rgba(100, 100, 100, 0.5) 0%, 
      rgba(150, 150, 150, 0.7) 20%, 
      rgba(100, 100, 100, 0.5) 40%
    );
    background-size: 200% 100%;
    animation: filmMoving-mixtape 2s linear infinite;
  }
  
  @keyframes filmMoving-mixtape {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
  
  /* Eject button */
  .eject-button-mixtape {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 6px 10px;
    background: #C9B690;
    border: none;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 16px;
    color: #5C4E33;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 20;
    animation: pulseButton-mixtape 2s infinite;
  }
  
  @keyframes pulseButton-mixtape {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); box-shadow: 0 0 10px rgba(138, 123, 89, 0.3); }
  }

  .eject-button-mixtape.can-insert-mixtape {
    background: #8A7B59;
    color: #F5EAD5;
    border: 1px solid #F5EAD5;
    box-shadow: 0 0 10px rgba(245, 234, 213, 0.5);
  }
  
  .eject-button-mixtape:hover {
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .eject-button-mixtape:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    animation: none;
  }

  /* Track display */
  .track-display-mixtape {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #E5D8B9;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #C9B690;
  }
  
  .track-label-mixtape {
    font-size: 16px;
    color: #5C4E33;
    font-weight: bold;
  }
  
  .playing-indicator-mixtape {
    width: 10px;
    height: 10px;
  }
  
  .blink-mixtape {
    animation: blink-mixtape 1s step-end infinite;
    color: #C13628;
    font-size: 16px;
  }
  
  @keyframes blink-mixtape {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  /* Player controls */
  .player-controls-mixtape {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .control-button-mixtape {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    color: #8A7B59;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .control-button-mixtape:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .play-button-mixtape {
    width: 50px;
    height: 50px;
  }
  
  .play-button-mixtape.active-mixtape {
    background: #C9B690;
    color: #F5EAD5;
  }
  
  .player-error-mixtape {
    margin-top: 10px;
    padding: 8px;
    background: #FFE6E6;
    border: 1px solid #C13628;
    border-radius: 4px;
    color: #C13628;
    text-align: center;
    font-size: 14px;
  }
  
  .mobile-note-mixtape {
    margin-top: 15px;
    text-align: center;
    font-size: 12px;
    color: #8A7B59;
    font-style: italic;
  }
  
  /* Modal styling */
  .modal-overlay-mixtape {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content-mixtape {
    width: 90%;
    max-width: 350px;
    background: #F5EAD5;
    border-radius: 8px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  
  .modal-header-mixtape {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    background: #E5D8B9;
    border-bottom: 1px solid #C9B690;
  }
  
  .modal-header-mixtape h3 {
    margin: 0;
    color: #5C4E33;
    font-size: 18px;
  }
  
  .modal-close-mixtape {
    background: none;
    border: none;
    color: #8A7B59;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-close-mixtape:hover {
    color: #C13628;
  }
  
  .modal-body-mixtape {
    padding: 15px;
  }
  
  .modal-form-mixtape {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group-mixtape {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-group-mixtape label {
    font-size: 14px;
    color: #5C4E33;
    font-weight: bold;
  }
  
  .form-input-mixtape {
    padding: 8px 10px;
    border: 1px solid #C9B690;
    border-radius: 4px;
    background: white;
    font-family: 'VT323', monospace;
    font-size: 16px;
    color: #5C4E33;
  }
  
  .modal-footer-mixtape {
    padding: 10px 15px 15px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  
  .modal-add-btn-mixtape, .modal-cancel-btn-mixtape {
    padding: 8px 15px;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 16px;
    cursor: pointer;
  }
  
  .modal-add-btn-mixtape {
    background: #8A7B59;
    color: #F5EAD5;
    border: none;
  }
  
  .modal-add-btn-mixtape:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .modal-cancel-btn-mixtape {
    background: #E5D8B9;
    color: #8A7B59;
    border: 1px solid #C9B690;
  }
  
  /* Responsive styling */
  @media (max-width: 480px) {
    .control-button-mixtape {
      width: 36px;
      height: 36px;
    }
    
    .play-button-mixtape {
      width: 46px;
      height: 46px;
    }
    
    .cassette-window-mixtape {
      height: 180px;
    }
  }
  
  /* Enhanced Modal Styling for Playlists */
  .playlist-modal-mixtape {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .playlist-instruction-mixtape {
    text-align: center;
    margin-bottom: 10px;
    color: #8A7B59;
    font-style: italic;
  }
  
  .playlist-container-modal-mixtape {
    overflow-y: auto;
    max-height: 50vh;
    border: 1px solid #C9B690;
    border-radius: 4px;
    background: #F5EAD5;
    margin-bottom: 15px;
    padding: 5px;
  }
  
  .playlist-item-mixtape {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 4px;
    margin-bottom: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .playlist-item-mixtape:last-child {
    margin-bottom: 0;
  }
  
  .playlist-item-mixtape:hover {
    background: #E5D8B9;
  }
  
  .playlist-item-mixtape.selected-mixtape {
    background: #C9B690;
    border-color: #8A7B59;
  }
  
  .playlist-item-name-mixtape {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #5C4E33;
    font-size: 14px;
  }
  
  .delete-btn-mixtape {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 4px;
    color: #C13628;
    margin-left: 5px;
    cursor: pointer;
  }
  
  .delete-btn-mixtape:hover {
    background: #C9B690;
  }
  
  .empty-playlist-mixtape {
    text-align: center;
    padding: 20px 0;
    color: #8A7B59;
    font-style: italic;
  }
  
  .modal-footer-mixtape {
    padding: 10px 15px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .new-mixtape-btn-mixtape {
    font-size: 14px;
    padding: 8px 12px;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    display: flex;
    align-items: center;
    gap: 5px;
    color: #5C4E33;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    cursor: pointer;
  }
  
  .new-mixtape-btn-mixtape:hover {
    background: #C9B690;
  }
  
  .modal-insert-btn-mixtape {
    padding: 8px 15px;
    background: #8A7B59;
    color: #F5EAD5;
    border: none;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 16px;
    cursor: pointer;
  }
  
  .modal-insert-btn-mixtape:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
document.head.appendChild(style);

export default RetroTapePlayer;