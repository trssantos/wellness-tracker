import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Trash, Plus, X } from 'lucide-react';
import './TapePlayer.css';

const RetroTapePlayer = ({ isMuted, theme = 'modern' }) => {
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
  const youtubePlayerElementRef = useRef(null); // New ref for the player element
  
  // Track component mount state
  const isMounted = useRef(true);
  
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
    
    // Set mounted flag
    isMounted.current = true;

    return () => {
      // Cleanup YouTube player on unmount
      cleanupYouTubePlayer();
      window.onYouTubeIframeAPIReady = null;
      isMounted.current = false;
    };
  }, []);

  // Handle clicks outside the playlist modal
  useEffect(() => {
    if (!showPlaylistModal) return;
    
    const handleClickOutside = (event) => {
      if (
        playlistRef.current && 
        !playlistRef.current.contains(event.target) &&
        !event.target.classList.contains('tape-eject-button')
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

  // Cleanup function for the YouTube player
  const cleanupYouTubePlayer = () => {
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.destroy();
      } catch (e) {
        console.error("Error destroying YouTube player:", e);
      }
      youtubePlayerRef.current = null;
    }
  };

  // Initialize YouTube player function
  const initializeYouTubePlayer = (videoId) => {
    if (!videoId || !window.YT || !window.YT.Player || !isMounted.current) {
      return;
    }
    
    // Clean up existing player first
    cleanupYouTubePlayer();
    
    try {
      // Use an explicit div element instead of id-based lookup
      // This avoids the DOM manipulation conflict
      youtubePlayerRef.current = new window.YT.Player(youtubePlayerElementRef.current, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0
        },
        events: {
          onReady: (event) => {
            if (!isMounted.current) return;
            
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
            if (!isMounted.current) return;
            
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNextTrack();
            }
          },
          onError: (event) => {
            if (!isMounted.current) return;
            
            console.error("YouTube player error:", event.data);
            setPlayerError(`Error playing video (${event.data})`);
          }
        }
      });
    } catch (e) {
      console.error("Error initializing YouTube player:", e);
      setPlayerError("Error initializing player");
    }
  };

  // Initialize or update YouTube player when track changes
  useEffect(() => {
    if (!isInserted || playlist.length === 0) {
      return;
    }
    
    if (currentTrack >= playlist.length) {
      setCurrentTrack(0);
      return;
    }
    
    const url = playlist[currentTrack].url;
    let id = extractYouTubeId(url);
    
    setYoutubeId(id);
    
    // Only initialize if we're fully inserted (not during animation)
    if (isInserted && !isInserting && !isEjecting) {
      // Use a small delay to ensure DOM is stable
      const timer = setTimeout(() => {
        if (isMounted.current) {
          initializeYouTubePlayer(id);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentTrack, isInserted, isInserting, isEjecting, playlist, isMuted]);

  // Update player state when play/pause or mute changes
  useEffect(() => {
    if (!isInserted || !youtubePlayerRef.current) return;
    
    try {
      if (youtubePlayerRef.current.getPlayerState) {
        const playerState = youtubePlayerRef.current.getPlayerState();
        
        if (isPlaying && playerState !== 1) {
          youtubePlayerRef.current.playVideo();
        } else if (!isPlaying && playerState === 1) {
          youtubePlayerRef.current.pauseVideo();
        }
      }
    } catch (e) {
      console.error("Error controlling YouTube player:", e);
    }
  }, [isPlaying, isInserted]);

  // Handle mute changes
  useEffect(() => {
    if (!youtubePlayerRef.current) return;
    
    try {
      if (youtubePlayerRef.current.mute && youtubePlayerRef.current.unMute) {
        if (isMuted) {
          youtubePlayerRef.current.mute();
        } else {
          youtubePlayerRef.current.unMute();
        }
      }
    } catch (e) {
      console.error("Error setting mute state:", e);
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
      if (!isMounted.current) return;
      
      // Clean up YouTube player before changing state
      cleanupYouTubePlayer();
      
      setIsEjecting(false);
      setIsInserted(false);
      
      // Reset errors
      if (playerError) {
        setPlayerError(null);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isEjecting, playerError]);

  // Handle insertion animation completion
  useEffect(() => {
    if (!isInserting) return;
    
    const timer = setTimeout(() => {
      if (!isMounted.current) return;
      
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
  }, [isInserting, playerError]);

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
    
    if (isEjecting || isInserting) {
      // Don't allow new actions during animations
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
    if (selectedMixtapeIndex === null || isEjecting || isInserting) return;
    
    setCurrentTrack(selectedMixtapeIndex);
    setIsInserting(true);
    playSound(insertSound);
    setShowPlaylistModal(false);
  };

  // Eject the current tape
  const ejectTape = () => {
    if (isEjecting || isInserting) return;
    
    // Stop playback
    setIsPlaying(false);
    
    // Stop YouTube player
    if (youtubePlayerRef.current && youtubePlayerRef.current.stopVideo) {
      try {
        youtubePlayerRef.current.stopVideo();
      } catch (e) {
        console.error("Error stopping video:", e);
      }
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
    if (!isInserted || playlist.length <= 1 || isEjecting || isInserting) return;
    
    playSound(clickSound);
    
    // Calculate the new track index
    const newIndex = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
    
    // Start track change sequence
    handleTrackChange(newIndex);
  };

  // Go to next track with proper animation sequence
  const handleNextTrack = () => {
    if (!isInserted || playlist.length <= 1 || isEjecting || isInserting) return;
    
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
    
    // Clean up the YouTube player first
    cleanupYouTubePlayer();
    
    // Start ejection animation
    setIsEjecting(true);
    playSound(ejectSound);
    
    // After ejection is complete, change track and start insertion
    const trackChangeTimer = setTimeout(() => {
      if (!isMounted.current) return;
      
      setCurrentTrack(newIndex);
      setIsInserted(false);
      
      // Small delay before starting insertion
      const insertionTimer = setTimeout(() => {
        if (!isMounted.current) return;
        
        setIsInserting(true);
        playSound(insertSound);
      }, 300);
    }, 1000);
    
    // Return cleanup function to handle component unmount during animation
    return () => {
      clearTimeout(trackChangeTimer);
    };
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
    <div className={`tape-player theme-${theme}`} ref={playerContainerRef}>
      {/* Cassette UI */}
      <div className="tape-cassette-container">
        <div className="tape-radio-tuner">
          <div className="tape-tuner-line"></div>
          <div className="tape-frequency-scale">
            <span>88</span>
            <span>92</span>
            <span>96</span>
            <span>100</span>
            <span>104</span>
            <span>108</span>
            <span>MHz</span>
          </div>
          <div className="tape-tuner-indicator"></div>
        </div>
        
        <div className="tape-cassette-window">
          {/* Cassette visualization */}
          {(isInserted || isInserting || isEjecting) && (
            <div className={`tape-cassette ${isEjecting ? 'tape-ejecting' : isInserting ? 'tape-inserting' : 'tape-inserted'}`}>
              <div className="tape-cassette-body">
                <div className="tape-cassette-inner">
                  <div className="tape-cassette-reel left-reel">
                    <div className={`tape-reel-spokes ${isPlaying ? 'tape-spinning' : ''}`}></div>
                  </div>
                  <div className="tape-cassette-reel right-reel">
                    <div className={`tape-reel-spokes ${isPlaying ? 'tape-spinning' : ''}`}></div>
                  </div>
                </div>
                <div className="tape-cassette-label">
                  <div className="tape-label-content">
                    {getCurrentTrack()?.name || 'Workout Mix'}
                  </div>
                </div>
                <div className="tape-cassette-window-film">
                  <div className={`tape-film ${isPlaying ? 'tape-moving' : ''}`}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Insert/Eject button */}
          <button 
            onClick={handleInsertButton}
            className="tape-eject-button"
            disabled={isEjecting || isInserting}
          >
            {isInserted ? 'EJECT' : 'INSERT'}
          </button>
        </div>
        
        {/* Track display */}
        <div className="tape-track-display">
          <span className="tape-track-label">
            {playlist.length > 0 
              ? `TRACK ${currentTrack + 1}/${playlist.length}` 
              : 'NO TRACKS'}
          </span>
          <div className="tape-playing-indicator">
            {isPlaying && <span className="tape-blink">►</span>}
          </div>
        </div>
        
        {/* Track info */}
        <div className="tape-track-info">
          {isInserted && getCurrentTrack() && 
            `Now playing: ${getCurrentTrack().name}`
          }
        </div>
        
        {/* Player controls */}
        <div className="tape-player-controls">
          <button 
            onClick={handlePrevTrack}
            disabled={!isInserted || playlist.length <= 1 || isEjecting || isInserting}
            className="tape-control-button tape-prev-button"
          >
            <SkipBack size={18} />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!isInserted || playlist.length === 0}
            className={`tape-control-button tape-play-button ${isPlaying ? 'tape-active' : ''}`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <button 
            onClick={handleNextTrack}
            disabled={!isInserted || playlist.length <= 1 || isEjecting || isInserting}
            className="tape-control-button tape-next-button"
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        {playerError && (
          <div className="tape-player-error">Error: {playerError}</div>
        )}
        
        <div className="tape-mobile-note">
          Note: On mobile devices, you may need to press pause and play when skipping tracks.
        </div>
      </div>
      
      {/* Playlist Selection Modal */}
      {showPlaylistModal && (
        <div className="tape-modal-overlay">
          <div className="tape-modal-content tape-playlist-modal" ref={playlistRef}>
            <div className="tape-modal-header">
              <h3>Select Music</h3>
              <button className="tape-modal-close" onClick={() => setShowPlaylistModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="tape-modal-body">
              <p className="tape-playlist-instruction">Choose a track, then press Insert</p>
              
              <div className="tape-playlist-container">
                {playlist.length === 0 ? (
                  <div className="tape-empty-playlist">No tracks available</div>
                ) : (
                  playlist.map((track, index) => (
                    <div 
                      key={index} 
                      className={`tape-playlist-item ${selectedMixtapeIndex === index ? 'tape-selected' : ''}`}
                      onClick={() => handleMixtapeSelect(index)}
                    >
                      <div className="tape-playlist-item-name">{track.name}</div>
                      <button 
                        className="tape-delete-btn" 
                        onClick={(e) => removeTrack(index, e)}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="tape-modal-footer">
              <button 
                onClick={openAddMixtapeModal}
                className="tape-new-mixtape-btn"
              >
                <Plus size={14} />
                <span>Add new track</span>
              </button>
              
              <button 
                onClick={insertSelectedTape}
                disabled={selectedMixtapeIndex === null}
                className="tape-modal-insert-btn"
              >
                Insert Track
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New Track Modal */}
      {showAddModal && (
        <div className="tape-modal-overlay">
          <div className="tape-modal-content">
            <div className="tape-modal-header">
              <h3>Add New Track</h3>
              <button className="tape-modal-close" onClick={closeAddMixtapeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="tape-modal-body">
              <div className="tape-modal-form">
                <div className="tape-form-group">
                  <label>Track Name</label>
                  <input
                    type="text"
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    placeholder="Enter a name for your track"
                    className="tape-form-input"
                  />
                </div>
                <div className="tape-form-group">
                  <label>YouTube URL</label>
                  <input
                    type="text"
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    placeholder="Enter a YouTube video URL"
                    className="tape-form-input"
                  />
                </div>
              </div>
            </div>
            <div className="tape-modal-footer">
              <button 
                onClick={addTrack}
                disabled={!newTrackUrl}
                className="tape-modal-add-btn"
              >
                Add Track
              </button>
              <button 
                onClick={closeAddMixtapeModal}
                className="tape-modal-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create a dedicated ref for the YouTube player */}
      <div ref={youtubePlayerElementRef} style={{ display: 'none' }}></div>
    </div>
  );
};

export default RetroTapePlayer;