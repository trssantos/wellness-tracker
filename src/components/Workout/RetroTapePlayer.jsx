import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Music, Plus, Edit, Trash } from 'lucide-react';

const RetroTapePlayer = ({ isMuted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackName, setNewTrackName] = useState('');
  const [playerError, setPlayerError] = useState(null);
  const [isInserted, setIsInserted] = useState(false);
  const [isEjecting, setIsEjecting] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [youtubeId, setYoutubeId] = useState('');
  const [playlist, setPlaylist] = useState(() => {
    // Load playlist from localStorage
    const savedPlaylist = localStorage.getItem('workout-playlist');
    return savedPlaylist ? JSON.parse(savedPlaylist) : [
      { name: "80s Workout Mix", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { name: "Synthwave Cardio", url: "https://www.youtube.com/watch?v=n8X9_MgEdCg" }
    ];
  });
  
  // Refs
  const playerContainerRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  
  // Sound effects - using direct web URLs
  const insertSound = useRef(new Audio('https://freesound.org/data/previews/456/456163_9482416-lq.mp3'));
  const ejectSound = useRef(new Audio('https://freesound.org/data/previews/277/277021_5324302-lq.mp3'));
  const clickSound = useRef(new Audio('https://freesound.org/data/previews/573/573588_13006337-lq.mp3'));

  // Load YouTube API
  useEffect(() => {
    // Load YouTube API script
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

  // Extract YouTube ID and initialize player when track changes
  useEffect(() => {
    if (playlist.length > 0 && currentTrack < playlist.length) {
      const url = playlist[currentTrack].url;
      let id = '';
      
      try {
        // Get YouTube video ID from URL
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
        
        setYoutubeId(id);

        // Initialize or update YouTube player
        if (id && window.YT && window.YT.Player && isInserted) {
          if (youtubePlayerRef.current) {
            youtubePlayerRef.current.destroy();
          }
          
          youtubePlayerRef.current = new window.YT.Player('youtube-player', {
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
                  nextTrack();
                }
              }
            }
          });
        }
      } catch (error) {
        console.error("Error setting up YouTube player:", error);
        setPlayerError("Failed to load YouTube player");
      }
    }
  }, [currentTrack, playlist, isInserted, isPlaying, isMuted]);

  // Update player state when mute changes
  useEffect(() => {
    if (youtubePlayerRef.current && youtubePlayerRef.current.mute && youtubePlayerRef.current.unMute) {
      if (isMuted) {
        youtubePlayerRef.current.mute();
      } else {
        youtubePlayerRef.current.unMute();
      }
    }
  }, [isMuted]);

  useEffect(() => {
    // Save playlist to localStorage when it changes
    localStorage.setItem('workout-playlist', JSON.stringify(playlist));
    
    // Preload sound files
    insertSound.current.preload = 'auto';
    ejectSound.current.preload = 'auto';
    clickSound.current.preload = 'auto';
  }, [playlist]);
  
  // Handle ejection animation completion
  useEffect(() => {
    if (isEjecting) {
      const timer = setTimeout(() => {
        setIsEjecting(false);
        setIsInserted(false);
        setShowPlaylist(true);
        
        // Stop YouTube player if it exists
        if (youtubePlayerRef.current && youtubePlayerRef.current.stopVideo) {
          youtubePlayerRef.current.stopVideo();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isEjecting]);
  
  // Handle insertion animation completion
  useEffect(() => {
    if (isInserting) {
      const timer = setTimeout(() => {
        setIsInserting(false);
        setIsInserted(true);
        setShowPlaylist(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInserting]);
  
  // Play sound effect
  const playSound = (sound) => {
    if (!isMuted && sound.current) {
      sound.current.currentTime = 0;
      sound.current.play().catch(err => console.log('Audio error:', err));
    }
  };
  
  // Handle tape ejection
  const ejectTape = () => {
    if (isPlaying) {
      setIsPlaying(false);
      
      // Stop YouTube player if it exists
      if (youtubePlayerRef.current && youtubePlayerRef.current.stopVideo) {
        youtubePlayerRef.current.stopVideo();
      }
    }
    
    setIsEjecting(true);
    playSound(ejectSound);
  };
  
  // Handle tape insertion
  const insertTape = () => {
    setIsInserting(true);
    playSound(insertSound);
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!isInserted) return;
    
    playSound(clickSound);
    
    setIsPlaying(prev => {
      const newState = !prev;
      
      // Control YouTube player
      if (youtubePlayerRef.current) {
        if (newState) {
          youtubePlayerRef.current.playVideo();
        } else {
          youtubePlayerRef.current.pauseVideo();
        }
      }
      
      return newState;
    });
  };
  
  // Handle previous track
  const prevTrack = () => {
    if (!isInserted || playlist.length === 0) return;
    
    playSound(clickSound);
    
    setCurrentTrack(prev => {
      const newIndex = prev === 0 ? playlist.length - 1 : prev - 1;
      return newIndex;
    });
  };
  
  // Handle next track
  const nextTrack = () => {
    if (!isInserted || playlist.length === 0) return;
    
    playSound(clickSound);
    
    setCurrentTrack(prev => {
      const newIndex = (prev + 1) % playlist.length;
      return newIndex;
    });
  };
  
  // Add track to playlist
  const addTrack = () => {
    if (!newTrackUrl) return;
    
    playSound(clickSound);
    
    // Add to playlist
    const trackName = newTrackName || `Track ${playlist.length + 1}`;
    setPlaylist(prev => [...prev, { name: trackName, url: newTrackUrl }]);
    setNewTrackUrl('');
    setNewTrackName('');
    setShowAddTrack(false);
  };
  
  // Remove track from playlist
  const removeTrack = (index) => {
    playSound(clickSound);
    
    setPlaylist(prev => {
      const newPlaylist = [...prev];
      newPlaylist.splice(index, 1);
      return newPlaylist;
    });
    
    // Adjust current track if needed
    if (currentTrack >= index) {
      setCurrentTrack(prev => Math.max(0, prev - 1));
    }
  };
  
  // Get current track
  const getCurrentTrack = () => {
    if (playlist.length === 0) return null;
    return playlist[currentTrack];
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
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
  
  return (
    <div className="vintage-player" ref={playerContainerRef}>
      {/* Cassette UI */}
      <div className="cassette-container">
        <div className="radio-tuner">
          <div className="tuner-line"></div>
          <div className="frequency-scale">
            <span>88</span>
            <span>92</span>
            <span>96</span>
            <span>100</span>
            <span>104</span>
            <span>108</span>
            <span>MHz</span>
          </div>
          <div className="tuner-indicator"></div>
        </div>
        
        <div className="cassette-window">
          {isInserted || isInserting || isEjecting ? (
            <div className={`cassette ${isEjecting ? 'ejecting' : isInserting ? 'inserting' : ''}`}>
              <div className="cassette-body">
                <div className="cassette-inner">
                  <div className="cassette-reel left-reel">
                    <div className={`reel-spokes ${isPlaying ? 'spinning' : ''}`}></div>
                  </div>
                  <div className="cassette-reel right-reel">
                    <div className={`reel-spokes ${isPlaying ? 'spinning' : ''}`}></div>
                  </div>
                </div>
                <div className="cassette-label">
                  <div className="label-content">
                    {getCurrentTrack()?.name || 'Workout Mix'}
                  </div>
                </div>
                <div className="cassette-window-film">
                  <div className={`film ${isPlaying ? 'moving' : ''}`}></div>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Playlist selection (shows when no tape is inserted) */}
          {showPlaylist && !isInserted && (
            <div className="mixtape-selection">
              <div className="mixtape-header">
                <h3>SELECT MIXTAPE</h3>
              </div>
              <div className="mixtape-list">
                {playlist.length === 0 ? (
                  <div className="empty-mixtape">No mixtapes available</div>
                ) : (
                  playlist.map((tape, index) => (
                    <div key={index} className="mixtape-item">
                      <button 
                        className="mixtape-select-btn"
                        onClick={() => {
                          setCurrentTrack(index);
                          insertTape();
                        }}
                      >
                        {tape.name}
                      </button>
                      <button 
                        className="mixtape-delete-btn" 
                        onClick={() => removeTrack(index)}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {/* Add new mixtape form */}
              {showAddTrack ? (
                <div className="add-mixtape-form">
                  <input
                    type="text"
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    placeholder="Mixtape name"
                    className="mixtape-input"
                  />
                  <input
                    type="text"
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    placeholder="YouTube URL"
                    className="mixtape-input"
                  />
                  <div className="mixtape-form-buttons">
                    <button 
                      onClick={addTrack}
                      disabled={!newTrackUrl}
                      className="mixtape-add-btn"
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => {
                        setShowAddTrack(false);
                        playSound(clickSound);
                      }}
                      className="mixtape-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setShowAddTrack(true);
                    playSound(clickSound);
                  }}
                  className="new-mixtape-btn"
                >
                  <Plus size={14} />
                  <span>Create a new mixtape</span>
                </button>
              )}
            </div>
          )}
          
          <button 
            onClick={isInserted ? ejectTape : insertTape}
            className="eject-button"
            disabled={isEjecting || isInserting}
          >
            {isInserted ? 'EJECT' : 'INSERT'}
          </button>
        </div>
        
        {/* Track display */}
        <div className="track-display">
          <span className="track-label">TRACK {currentTrack + 1}/{playlist.length}</span>
          <div className="playing-indicator">{isPlaying && <span className="blink">►</span>}</div>
        </div>
        
        {/* Player controls */}
        <div className="player-controls">
          <button 
            onClick={prevTrack}
            disabled={!isInserted || playlist.length <= 1}
            className="control-button prev-button"
          >
            <SkipBack size={18} />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!isInserted || playlist.length === 0}
            className={`control-button play-button ${isPlaying ? 'active' : ''}`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <button 
            onClick={nextTrack}
            disabled={!isInserted || playlist.length <= 1}
            className="control-button next-button"
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        <div className="mobile-note">
          Note: On mobile devices, you may need to press pause and play when skipping tracks.
        </div>
      </div>
      
      {/* Hidden YouTube player div */}
      <div id="youtube-player" style={{ display: 'none' }}></div>
    </div>
  );
};

// Add vintage player styles
const style = document.createElement('style');
style.innerHTML = `
  /* Vintage Cassette Player Styling */
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  
  .vintage-player {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    font-family: 'VT323', monospace;
  }
  
  .cassette-container {
    background: #F5EAD5;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
  }
  
  /* Radio tuner */
  .radio-tuner {
    height: 30px;
    background: #E5D8B9;
    border-radius: 15px;
    margin-bottom: 15px;
    position: relative;
    border: 2px solid #C9B690;
  }
  
  .tuner-line {
    position: absolute;
    top: 50%;
    left: 10px;
    right: 10px;
    height: 2px;
    background: #C9B690;
    transform: translateY(-50%);
  }
  
  .frequency-scale {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    position: relative;
    z-index: 1;
    font-size: 12px;
    color: #8A7B59;
  }
  
  .tuner-indicator {
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
  .cassette-window {
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
  .cassette {
    width: 80%;
    height: 75%;
    background: black;
    border-radius: 8px;
    position: relative;
    transition: transform 1s ease-in-out;
  }
  
  .cassette.ejecting {
    transform: translateY(-150%);
  }
  
  .cassette.inserting {
    transform: translateY(0);
    animation: insertAnimation 1s ease-in-out;
  }
  
  @keyframes insertAnimation {
    0% { transform: translateY(150%); }
    100% { transform: translateY(0); }
  }
  
  .cassette-body {
    width: 100%;
    height: 100%;
    padding: 10px;
    position: relative;
  }
  
  .cassette-inner {
    display: flex;
    justify-content: space-between;
    height: 50%;
    margin-bottom: 5px;
  }
  
  .cassette-reel {
    width: 40px;
    height: 40px;
    background: #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .reel-spokes {
    width: 80%;
    height: 80%;
    border-radius: 50%;
    background: #555;
    position: relative;
  }
  
  .reel-spokes::before, .reel-spokes::after {
    content: '';
    position: absolute;
    background: #333;
  }
  
  .reel-spokes::before {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    transform: translateX(-50%);
  }
  
  .reel-spokes::after {
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    transform: translateY(-50%);
  }
  
  .reel-spokes.spinning {
    animation: spinReel 2s linear infinite;
  }
  
  @keyframes spinReel {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .cassette-label {
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
  
  .label-content {
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
  
  .cassette-window-film {
    height: 20%;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }
  
  .film {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(100, 100, 100, 0.5);
    transform: translateY(-50%);
  }
  
  .film.moving {
    background: linear-gradient(90deg, 
      rgba(100, 100, 100, 0.5) 0%, 
      rgba(150, 150, 150, 0.7) 20%, 
      rgba(100, 100, 100, 0.5) 40%
    );
    background-size: 200% 100%;
    animation: filmMoving 2s linear infinite;
  }
  
  @keyframes filmMoving {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
  
  /* Eject button */
  .eject-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    padding: 5px 10px;
    background: #C9B690;
    border: none;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 12px;
    color: #8A7B59;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .eject-button:hover {
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .eject-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Mixtape selection */
  .mixtape-selection {
    width: 90%;
    height: 90%;
    background: #E5D8B9;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  
  .mixtape-header {
    text-align: center;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #C9B690;
  }
  
  .mixtape-header h3 {
    margin: 0;
    font-size: 16px;
    color: #8A7B59;
  }
  
  .mixtape-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 10px;
  }
  
  .empty-mixtape {
    text-align: center;
    padding: 20px 0;
    color: #8A7B59;
    font-style: italic;
  }
  
  .mixtape-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  
  .mixtape-select-btn {
    flex: 1;
    padding: 5px 10px;
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 14px;
    color: #8A7B59;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 5px;
  }
  
  .mixtape-delete-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 4px;
    color: #C13628;
  }
  
  /* Add new mixtape form */
  .add-mixtape-form {
    padding: 5px;
    background: #F5EAD5;
    border-radius: 4px;
    border: 1px solid #C9B690;
  }
  
  .mixtape-input {
    width: 100%;
    padding: 5px;
    margin-bottom: 5px;
    background: #FFFFFF;
    border: 1px solid #C9B690;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 14px;
    color: #8A7B59;
  }
  
  .mixtape-form-buttons {
    display: flex;
    gap: 5px;
  }
  
  .mixtape-add-btn, .mixtape-cancel-btn {
    flex: 1;
    padding: 5px;
    font-family: 'VT323', monospace;
    font-size: 14px;
    border-radius: 4px;
    border: none;
  }
  
  .mixtape-add-btn {
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .mixtape-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .mixtape-cancel-btn {
    background: #E5D8B9;
    color: #8A7B59;
    border: 1px solid #C9B690;
  }
  
  .new-mixtape-btn {
    width: 100%;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background: #C9B690;
    border: none;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 14px;
    color: #8A7B59;
  }
  
  /* Track display */
  .track-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #E5D8B9;
    padding: 5px 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #C9B690;
  }
  
  .track-label {
    font-size: 14px;
    color: #8A7B59;
  }
  
  .playing-indicator {
    width: 10px;
    height: 10px;
  }
  
  .blink {
    animation: blink 1s step-end infinite;
    color: #C13628;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  /* Player controls */
  .player-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .control-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    color: #8A7B59;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .play-button {
    width: 50px;
    height: 50px;
  }
  
  .play-button.active {
    background: #C9B690;
    color: #F5EAD5;
  }
  
  .mobile-note {
    margin-top: 15px;
    text-align: center;
    font-size: 12px;
    color: #8A7B59;
    font-style: italic;
  }
  
  /* Responsive styling */
  @media (max-width: 480px) {
    .control-button {
      width: 36px;
      height: 36px;
    }
    
    .play-button {
      width: 46px;
      height: 46px;
    }
    
    .cassette-window {
      height: 180px;
    }
  }
`;
document.head.appendChild(style);

export default RetroTapePlayer;