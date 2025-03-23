import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../components/ThemeProvider';
import { Mic, MicOff, Volume2, VolumeX, Camera, CameraOff, Minimize, Settings } from 'lucide-react';
import { fetchCoachResponse } from '../../utils/dayCoachApi';
import { saveDayCoachMessage } from '../../utils/dayCoachUtils';

// Expressions map to use throughout the component
const EXPRESSIONS = {
  NEUTRAL: 'neutral',
  HAPPY: 'happy',
  THINKING: 'thinking',
  SAD: 'sad',
  SURPRISED: 'surprised',
  EXCITED: 'excited',
  CONFUSED: 'confused',
  SLEEPING: 'sleeping',
  WINKING: 'winking'
};

// Personality quirks
const QUIRKS = [
  { type: 'look_around', chance: 0.3, minInterval: 8000, message: null },
  { type: 'blink_sequence', chance: 0.15, minInterval: 12000, message: null },
  { type: 'sleepy', chance: 0.1, minInterval: 30000, message: null },
  { type: 'think_about', chance: 0.2, minInterval: 15000, message: "I was just thinking about your progress this week..." },
  { type: 'curious', chance: 0.2, minInterval: 20000, message: "I wonder what you're planning today?" },
  { type: 'excited', chance: 0.1, minInterval: 25000, message: "I just had a great idea for your routine!" }
];

const SolarisRobot = (props) => {
  const { onClose, onSendMessage } = props;
  const initialMessages = props.messages || [];
  
  // Then update the messages state initialization
  const [messages, setMessages] = useState(initialMessages);
  // Three.js refs
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Eye elements
  const eyesRef = useRef({ 
    left: { main: null, pupil: null, highlight: null, lid: null },
    right: { main: null, pupil: null, highlight: null, lid: null }
  });
  
  // Expression elements
  const eyebrowsRef = useRef({ left: null, right: null });
  const mouthRef = useRef(null);
  
  // Animation timers and state
  const blinkTimeoutRef = useRef(null);
  const lookTimeoutRef = useRef(null);
  const quirkTimeoutRef = useRef(null);
  const lastQuirkTimeRef = useRef({});
  
  // Media elements
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  
  // Theme context
  const { theme } = useTheme();
  
  // Component state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [lookTarget, setLookTarget] = useState({ x: 0, y: 0 });
  const [messageInput, setMessageInput] = useState('');
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(EXPRESSIONS.NEUTRAL);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [visualizerData, setVisualizerData] = useState(new Array(32).fill(5));
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUserInteraction, setLastUserInteraction] = useState(Date.now());
  const [settingsValues, setSettingsValues] = useState({
    voiceRate: 1.0,
    voicePitch: 1.0,
    eyeColor: '#4dd0e1',
    accentColor: '#0288d1',
    personalityLevel: 0.7
  });

  // Add this state
const [startupPhase, setStartupPhase] = useState(0); // 0: starting, 1: eyes appearing, 2: fully active



  
  // Initialize the robot
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize messages from props if available
  if (props.messages && props.messages.length > 0) {
    setMessages(props.messages);
  }
    
    // Initialize Three.js scene
    initThreeJS();
    
    // Initialize speech synthesis
    initSpeechSynthesis();
    
    // Initialize speech recognition if supported
    initSpeechRecognition();
    
    // Schedule animations
    scheduleBlinking();
    scheduleLookAround();
    schedulePersonalityQuirks();
    
    // Add user interaction tracking
    document.addEventListener('mousemove', handleUserInteraction);
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    // Welcome message after a short delay
    setTimeout(() => {
      speakText("Hello! I'm Solaris. You can talk to me or use the chat. How can I help you today?");
      setCurrentExpression(EXPRESSIONS.HAPPY);
      
      setTimeout(() => {
        setCurrentExpression(EXPRESSIONS.NEUTRAL);
      }, 3000);
    }, 1000);
    
    // Clean up function
    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clear timers
      clearTimeout(blinkTimeoutRef.current);
      clearTimeout(lookTimeoutRef.current);
      clearTimeout(quirkTimeoutRef.current);
      
      // Stop camera if active
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      // Stop speech recognition
      if (recognition && recognition.stop) {
        try {
          recognition.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }
      
      // Stop any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Remove DOM event listeners
      document.removeEventListener('mousemove', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      
      // Clean up audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Add this effect for startup animation
useEffect(() => {
  // Phase 0: Initial delay
  setTimeout(() => {
    setStartupPhase(1); // Eyes appearing
    
    // Phase 1: Eyes fully appear and calibrate
    setTimeout(() => {
      // Look sequence to simulate eye calibration
      const calibrationSequence = [
        { x: 0, y: 0 },    // Center
        { x: 1, y: 0 },    // Right
        { x: -1, y: 0 },   // Left
        { x: 0, y: 1 },    // Up
        { x: 0, y: -1 },   // Down
        { x: 0, y: 0 }     // Back to center
      ];
      
      calibrationSequence.forEach((pos, index) => {
        setTimeout(() => {
          setLookTarget(pos);
        }, index * 300);
      });
      
      // Blink after calibration
      setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          setStartupPhase(2); // Fully active
        }, 200);
      }, calibrationSequence.length * 300 + 200);
      
    }, 1000);
  }, 500);
}, []);

  // Monitor messages for new bot responses
useEffect(() => {
  if (messages.length === 0) return;
  
  // Get the latest message
  const latestMessage = messages[messages.length - 1];
  
  // Only process if it's from the coach/bot and not something we've already spoken
  if (latestMessage.sender === 'coach' && !latestMessage.spoken) {
    // Show "thinking" then set expression based on content immediately
    setCurrentExpression(EXPRESSIONS.THINKING);
    
    // Mark as spoken to prevent repeated speaking
    latestMessage.spoken = true;
    
    // Add a slight delay for realism before speaking
    setTimeout(() => {
      // Log that we're about to speak
      console.log("Speaking newest response:", latestMessage.content);
      
      // Speak the response
      if (isSpeechEnabled) {
        speakText(latestMessage.content);
      }
      
      // Set appropriate expression based on content
      const newExpression = 
        latestMessage.content.includes('?') ? EXPRESSIONS.CURIOUS :
        latestMessage.content.includes('!') ? EXPRESSIONS.EXCITED :
        latestMessage.content.toLowerCase().includes('sorry') ? EXPRESSIONS.SAD :
        EXPRESSIONS.HAPPY;
      
      console.log("Setting expression for bot response:", newExpression);
      setCurrentExpression(newExpression);
      
      // Return to neutral after a delay
      setTimeout(() => {
        setCurrentExpression(EXPRESSIONS.NEUTRAL);
      }, 5000);
    }, 500);
  }
}, [messages]);

  // Add this effect after your initialization effect
useEffect(() => {
  // Update local messages state when props messages change
  if (props.messages && props.messages.length > 0) {
    setMessages(props.messages);
  }
}, [props.messages]);
  
  // Initialize Three.js
  const initThreeJS = () => {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x1e293b : 0x1a202c);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create robot face elements
    createFace();

    // Add direct animation system
let lastBlinkTime = 0;
let blinkActive = false;


    const directAnimationSystem = () => {
      const currentTime = Date.now();
      
      // Handle blinking directly
      if (!blinkActive && currentTime - lastBlinkTime > 3000) {
        // Time to blink
        if (eyesRef.current.left.lid && eyesRef.current.right.lid) {
          eyesRef.current.left.lid.scale.y = 1;
          eyesRef.current.right.lid.scale.y = 1;
        }
        blinkActive = true;
        
        // Reset lids after short delay
        setTimeout(() => {
          if (eyesRef.current.left.lid && eyesRef.current.right.lid) {
            eyesRef.current.left.lid.scale.y = 0;
            eyesRef.current.right.lid.scale.y = 0;
          }
          blinkActive = false;
          lastBlinkTime = Date.now();
        }, 150);
      }
    };
    
    // Set up animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      updateFaceAnimations();
      directAnimationSystem(); // Add direct animation control
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
  };
  
  // Create the face elements
  const createFace = () => {
    // Create base face shape (used as a reference, not visible)
    const faceGeometry = new THREE.CircleGeometry(6, 32);
    const faceMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      transparent: true,
      opacity: 0 
    });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    sceneRef.current.add(face);
    
    // Create eyes
    createEyes();
    
    // Create eyebrows
    createEyebrows();
    
    // Create mouth
    createMouth();
  };
  
  // Create eyes with more details
  const createEyes = () => {
    const eyeColor = new THREE.Color(settingsValues.eyeColor);
    const accentColor = new THREE.Color(settingsValues.accentColor);
    
    // Eyes
    const eyeGeometry = new THREE.CircleGeometry(1.5, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ 
      color: eyeColor, 
      transparent: true,
      opacity: 0.9
    });
    
    // Pupils
    const pupilGeometry = new THREE.CircleGeometry(0.6, 32);
    const pupilMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    
    // Eye highlights
    const highlightGeometry = new THREE.CircleGeometry(0.3, 32);
    const highlightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    
    // Eyelids
    const lidGeometry = new THREE.CircleGeometry(1.7, 32, 0, Math.PI);
    const lidMaterial = new THREE.MeshBasicMaterial({ 
      color: theme === 'dark' ? 0x1e293b : 0x1a202c,
      transparent: true,
      opacity: 0.9
    });
    
    // Left eye group
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-2.5, 0, 0);
    sceneRef.current.add(leftEye);
    eyesRef.current.left.main = leftEye;
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-2.5, 0, 0.1);
    sceneRef.current.add(leftPupil);
    eyesRef.current.left.pupil = leftPupil;
    
    const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    leftHighlight.position.set(-2.3, 0.2, 0.2);
    sceneRef.current.add(leftHighlight);
    eyesRef.current.left.highlight = leftHighlight;
    
    const leftLid = new THREE.Mesh(lidGeometry, lidMaterial);
    leftLid.position.set(-2.5, 0, 0.3);
    leftLid.rotation.z = Math.PI;
    leftLid.scale.set(1, 0, 1);
    sceneRef.current.add(leftLid);
    eyesRef.current.left.lid = leftLid;
    
    // Right eye group
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(2.5, 0, 0);
    sceneRef.current.add(rightEye);
    eyesRef.current.right.main = rightEye;
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(2.5, 0, 0.1);
    sceneRef.current.add(rightPupil);
    eyesRef.current.right.pupil = rightPupil;
    
    const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    rightHighlight.position.set(2.7, 0.2, 0.2);
    sceneRef.current.add(rightHighlight);
    eyesRef.current.right.highlight = rightHighlight;
    
    const rightLid = new THREE.Mesh(lidGeometry, lidMaterial);
    rightLid.position.set(2.5, 0, 0.3);
    rightLid.rotation.z = Math.PI;
    rightLid.scale.set(1, 0, 1);
    sceneRef.current.add(rightLid);
    eyesRef.current.right.lid = rightLid;
    
    // Add glow effects
    addEyeGlow(-2.5, 0, eyeColor, accentColor);
    addEyeGlow(2.5, 0, eyeColor, accentColor);
  };
  
  // Create eyebrows for expressions
  const createEyebrows = () => {
    const browGeometry = new THREE.BoxGeometry(1.8, 0.3, 0.1);
    const browMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.9
    });
    
    // Left eyebrow
    const leftBrow = new THREE.Mesh(browGeometry, browMaterial);
    leftBrow.position.set(-2.5, 1.8, 0.3);
    sceneRef.current.add(leftBrow);
    eyebrowsRef.current.left = leftBrow;
    
    // Right eyebrow
    const rightBrow = new THREE.Mesh(browGeometry, browMaterial);
    rightBrow.position.set(2.5, 1.8, 0.3);
    sceneRef.current.add(rightBrow);
    eyebrowsRef.current.right = rightBrow;
  };
  
  // Create mouth for expressions
  const createMouth = () => {
    // Use curve for the mouth to allow for different expressions
    const curve = new THREE.EllipseCurve(
      0, -3,            // Center x, y
      2, 0.3,           // x radius, y radius
      0, Math.PI,       // Start angle, end angle
      false,            // Clockwise
      0                 // Rotation
    );
    
    const points = curve.getPoints(50);
    const mouthGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const mouthMaterial = new THREE.LineBasicMaterial({ 
      color: 0x333333,
      linewidth: 3
    });
    
    const mouth = new THREE.Line(mouthGeometry, mouthMaterial);
    mouth.position.z = 0.3;
    sceneRef.current.add(mouth);
    mouthRef.current = mouth;
  };
  
  // Add glow effect to eyes
  const addEyeGlow = (x, y, mainColor, accentColor) => {
    // Outer glow
    const outerGlowGeometry = new THREE.CircleGeometry(1.9, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({ 
      color: accentColor,
      transparent: true,
      opacity: 0.2
    });
    
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    outerGlow.position.set(x, y, -0.2);
    sceneRef.current.add(outerGlow);
    
    // Inner glow
    const innerGlowGeometry = new THREE.CircleGeometry(1.7, 32);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({ 
      color: mainColor,
      transparent: true,
      opacity: 0.4
    });
    
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    innerGlow.position.set(x, y, -0.1);
    sceneRef.current.add(innerGlow);
  };
  
  // Update face animations each frame
  const updateFaceAnimations = () => {
    if (!eyesRef.current.left.main || !eyesRef.current.right.main) return;
    
    // Handle startup animation phases
    if (startupPhase < 2) {
      const opacity = startupPhase === 0 ? 0 : Math.min(1, (Date.now() % 1000) / 1000);
      
      // Fade in eyes during startup
      eyesRef.current.left.main.material.opacity = opacity;
      eyesRef.current.right.main.material.opacity = opacity;
      eyesRef.current.left.pupil.material.opacity = opacity * 0.8;
      eyesRef.current.right.pupil.material.opacity = opacity * 0.8;
      eyesRef.current.left.highlight.material.opacity = opacity * 0.8;
      eyesRef.current.right.highlight.material.opacity = opacity * 0.8;
      
      // Don't run other animations during startup
      if (startupPhase === 0) return;
    }
    
    // Handle eye movements
    updateEyeMovements();
    
    // Handle blinking - add console log to debug
    if (isBlinking) {
      console.log("Blinking animation active");
      
      // When blinking, scale eyelids to cover eyes
      if (eyesRef.current.left.lid) {
        eyesRef.current.left.lid.scale.y = 1;
      }
      if (eyesRef.current.right.lid) {
        eyesRef.current.right.lid.scale.y = 1;
      }
    } else {
      // When not blinking, eyelids should be hidden (unless sleeping)
      if (currentExpression !== EXPRESSIONS.SLEEPING) {
        if (eyesRef.current.left.lid) {
          eyesRef.current.left.lid.scale.y = 0;
        }
        if (eyesRef.current.right.lid) {
          eyesRef.current.right.lid.scale.y = 0; 
        }
      }
    }
    
    // Handle expressions
    updateExpression();
    
    // Handle audio visualizer if speaking
    if (isSpeaking) {
      updateMouthForSpeech();
    }
  };
  
  
  // Update eye positions based on look target
  const updateEyeMovements = () => {
    // Base eye positions
    const leftBaseX = -2.5;
    const rightBaseX = 2.5;
    const baseY = 0;
    
    // Calculate target positions with limits
    const maxMove = 0.3;
    const leftTargetX = leftBaseX + Math.max(-maxMove, Math.min(maxMove, lookTarget.x * 0.3));
    const rightTargetX = rightBaseX + Math.max(-maxMove, Math.min(maxMove, lookTarget.x * 0.3));
    const targetY = baseY + Math.max(-maxMove, Math.min(maxMove, lookTarget.y * 0.3));
    
    // Smoothly move main eyes
    eyesRef.current.left.main.position.x += (leftTargetX - eyesRef.current.left.main.position.x) * 0.1;
    eyesRef.current.right.main.position.x += (rightTargetX - eyesRef.current.right.main.position.x) * 0.1;
    eyesRef.current.left.main.position.y += (targetY - eyesRef.current.left.main.position.y) * 0.1;
    eyesRef.current.right.main.position.y += (targetY - eyesRef.current.right.main.position.y) * 0.1;
    
    // Move pupils with slight exaggeration for more expressive look
    eyesRef.current.left.pupil.position.x += (leftTargetX + lookTarget.x * 0.1 - eyesRef.current.left.pupil.position.x) * 0.1;
    eyesRef.current.right.pupil.position.x += (rightTargetX + lookTarget.x * 0.1 - eyesRef.current.right.pupil.position.x) * 0.1;
    eyesRef.current.left.pupil.position.y += (targetY + lookTarget.y * 0.1 - eyesRef.current.left.pupil.position.y) * 0.1;
    eyesRef.current.right.pupil.position.y += (targetY + lookTarget.y * 0.1 - eyesRef.current.right.pupil.position.y) * 0.1;
    
    // Move highlights with slight offset
    eyesRef.current.left.highlight.position.x = eyesRef.current.left.pupil.position.x + 0.2;
    eyesRef.current.right.highlight.position.x = eyesRef.current.right.pupil.position.x + 0.2;
    eyesRef.current.left.highlight.position.y = eyesRef.current.left.pupil.position.y + 0.2;
    eyesRef.current.right.highlight.position.y = eyesRef.current.right.pupil.position.y + 0.2;
    
    // Position eyelids to follow eyes
    eyesRef.current.left.lid.position.x = eyesRef.current.left.main.position.x;
    eyesRef.current.right.lid.position.x = eyesRef.current.right.main.position.x;
    eyesRef.current.left.lid.position.y = eyesRef.current.left.main.position.y;
    eyesRef.current.right.lid.position.y = eyesRef.current.right.main.position.y;
  };
  
  // Update blinking animation
  const updateBlinking = () => {
    if (isBlinking) {
      // When blinking, scale eyelids to cover eyes
      eyesRef.current.left.lid.scale.y = 1;
      eyesRef.current.right.lid.scale.y = 1;
    } else {
      // When not blinking, eyelids should be hidden
      eyesRef.current.left.lid.scale.y = 0;
      eyesRef.current.right.lid.scale.y = 0;
    }
  };
  
  // Update expression on the face
  const updateExpression = () => {
    const { left, right } = eyebrowsRef.current;
    if (!left || !right || !mouthRef.current) return;
    
    // Reset transformations
    left.rotation.z = 0;
    right.rotation.z = 0;
    left.position.y = 1.8;
    right.position.y = 1.8;
    
    // Update pupil size based on expression
    let pupilScale = 1.0;
    
    // Different expressions
    switch(currentExpression) {
      case EXPRESSIONS.HAPPY:
        left.rotation.z = -0.2;
        right.rotation.z = 0.2;
        updateMouthCurve(0, -3, 2.5, 0.8, 0, Math.PI, true);
        pupilScale = 0.9;
        break;
        
      case EXPRESSIONS.SAD:
        left.rotation.z = 0.2;
        right.rotation.z = -0.2;
        left.position.y = 1.6;
        right.position.y = 1.6;
        updateMouthCurve(0, -3.3, 2, -0.3, Math.PI, Math.PI * 2, true);
        pupilScale = 1.1;
        break;
        
      case EXPRESSIONS.THINKING:
        left.rotation.z = -0.4;
        right.rotation.z = 0;
        left.position.y = 2;
        updateMouthCurve(0.5, -3, 1.5, 0.1, 0.3, Math.PI - 0.3);
        pupilScale = 0.8;
        eyesRef.current.left.pupil.scale.set(0.8, 0.8, 1);
        eyesRef.current.right.pupil.scale.set(1.2, 1.2, 1);
        break;
        
      case EXPRESSIONS.SURPRISED:
        left.position.y = 2.2;
        right.position.y = 2.2;
        updateMouthCurve(0, -3, 1, 1, 0, Math.PI * 2);
        pupilScale = 0.7;
        break;
        
      case EXPRESSIONS.EXCITED:
        left.rotation.z = -0.3;
        right.rotation.z = 0.3;
        left.position.y = 2.1;
        right.position.y = 2.1;
        updateMouthCurve(0, -2.8, 2.8, 1, 0, Math.PI, true);
        pupilScale = 0.7;
        break;
        
      case EXPRESSIONS.CONFUSED:
        left.rotation.z = -0.3;
        right.rotation.z = 0.4;
        left.position.y = 2;
        right.position.y = 1.7;
        updateMouthCurve(-0.5, -3, 1.5, 0.1, 0.3, Math.PI - 0.3, false, true);
        break;
        
      case EXPRESSIONS.SLEEPING:
        left.rotation.z = 0;
        right.rotation.z = 0;
        left.position.y = 1.6;
        right.position.y = 1.6;
        updateMouthCurve(0, -2.5, 1.5, 0.1, 0, Math.PI);
        // Make pupils invisible during sleep
        eyesRef.current.left.pupil.visible = false;
        eyesRef.current.right.pupil.visible = false;
        eyesRef.current.left.highlight.visible = false;
        eyesRef.current.right.highlight.visible = false;
        eyesRef.current.left.lid.scale.y = 1;
        eyesRef.current.right.lid.scale.y = 1;
        break;
        
      case EXPRESSIONS.WINKING:
        left.rotation.z = -0.2;
        right.rotation.z = 0.2;
        updateMouthCurve(0, -3, 2, 0.5, 0, Math.PI, true);
        eyesRef.current.left.lid.scale.y = 1; // Left eye wink
        eyesRef.current.right.lid.scale.y = 0;
        break;
        
      default: // NEUTRAL
        updateMouthCurve(0, -3, 2, 0.3, 0, Math.PI);
        pupilScale = 1.0;
        eyesRef.current.left.pupil.visible = true;
        eyesRef.current.right.pupil.visible = true;
        eyesRef.current.left.highlight.visible = true;
        eyesRef.current.right.highlight.visible = true;
    }
    
    // Apply pupil scaling for both eyes
    if (currentExpression !== EXPRESSIONS.THINKING) {
      eyesRef.current.left.pupil.scale.set(pupilScale, pupilScale, 1);
      eyesRef.current.right.pupil.scale.set(pupilScale, pupilScale, 1);
    }
  };
  
  // Update mouth curve based on parameters
  const updateMouthCurve = (x, y, xRadius, yRadius, startAngle, endAngle, isSmile = false, isAsymmetric = false) => {
    if (!mouthRef.current) return;
    
    // Create new curve
    const curve = new THREE.EllipseCurve(
      x, y,                  // Center x, y
      xRadius, yRadius,      // x radius, y radius
      startAngle, endAngle,  // Start angle, end angle
      isSmile,               // Clockwise if smiling
      0                      // Rotation
    );
    
    // If asymmetric, apply some distortion
    if (isAsymmetric) {
      const points = curve.getPoints(50);
      // Distort some points for asymmetry
      for (let i = 0; i < points.length; i++) {
        if (i > points.length / 2) {
          points[i].y += 0.2 * Math.sin((i / points.length) * Math.PI);
        }
      }
      mouthRef.current.geometry.setFromPoints(points);
    } else {
      const points = curve.getPoints(50);
      mouthRef.current.geometry.setFromPoints(points);
    }
  };
  
  // Update mouth for speech visualization
  const updateMouthForSpeech = () => {
    // Only update if speaking and we have visualizer data
    if (!isSpeaking || !visualizerData.length) return;
    
    // Calculate average audio level
    const avgLevel = visualizerData.reduce((sum, val) => sum + val, 0) / visualizerData.length;
    const normalizedLevel = Math.min(1, avgLevel / 100);
    
    // For debugging - uncomment if needed
    // console.log("Mouth animation with level:", normalizedLevel);
    
    // Use different mouth shapes based on audio level
    const mouthOpenness = 0.2 + normalizedLevel * 1.2; // Scale between 0.2 and 1.4
    
    // Update mouth curve with variable height based on audio
    updateMouthCurve(
      0, -3,                 // Center x, y
      2, mouthOpenness,      // x radius, y radius (y varies with sound)
      0, Math.PI * 2,        // Full circle for open mouth
      false,                 // Not clockwise
      visualizerData[0] > visualizerData[visualizerData.length - 1] // Slight asymmetry
    );
  };
  
  
  // Schedule random blinking
  const scheduleBlinking = () => {
    console.log("Scheduling next blink...");
    
    // Blink more frequently (1-3 seconds) to make it more noticeable
    const blinkDelay = 1000 + Math.random() * 2000;
    
    blinkTimeoutRef.current = setTimeout(() => {
      // Don't blink if already in sleep expression
      if (currentExpression !== EXPRESSIONS.SLEEPING) {
        console.log("Triggering blink!");
        setIsBlinking(true);
        
        // Reset blinking after a short delay
        setTimeout(() => {
          setIsBlinking(false);
          console.log("Blink complete, scheduling next");
          scheduleBlinking();
        }, 200);
      } else {
        scheduleBlinking();
      }
    }, blinkDelay);
  };
  
  // Schedule random looking around
  const scheduleLookAround = () => {
    const lookDelay = 3000 + Math.random() * 5000; // Look around every 3-8 seconds
    
    lookTimeoutRef.current = setTimeout(() => {
      // Don't look around if camera tracking is active or sleeping
      if (!isCameraActive && currentExpression !== EXPRESSIONS.SLEEPING) {
        setLookTarget({
          x: (Math.random() * 2 - 1) * 2, // Random between -2 and 2
          y: (Math.random() * 2 - 1)      // Random between -1 and 1
        });
      }
      scheduleLookAround();
    }, lookDelay);
  };
  
  // Schedule random personality quirks
  const schedulePersonalityQuirks = () => {
    const personalityFactor = settingsValues.personalityLevel; // 0 to 1
    const quirkDelay = 5000 + Math.random() * 10000 * (1/personalityFactor); // More quirks with higher personality
    
    quirkTimeoutRef.current = setTimeout(() => {
      // Check if user has interacted recently (within 30 seconds)
      const now = Date.now();
      const timeSinceInteraction = now - lastUserInteraction;
      
      // Only show quirks if some time has passed since last interaction or message
      if (timeSinceInteraction > 30000 && !isSpeaking) {
        const eligibleQuirks = QUIRKS.filter(quirk => {
          // Don't repeat a quirk if it happened recently
          const quirkLastTime = lastQuirkTimeRef.current[quirk.type] || 0;
          return now - quirkLastTime > quirk.minInterval;
        });
        
        // Select a random quirk based on chance
        for (const quirk of eligibleQuirks) {
          if (Math.random() < quirk.chance * personalityFactor) {
            performQuirk(quirk);
            lastQuirkTimeRef.current[quirk.type] = now;
            break;
          }
        }
      }
      
      schedulePersonalityQuirks();
    }, quirkDelay);
  };
  
  // Perform a specific personality quirk
  const performQuirk = (quirk) => {
    // Save original expression to restore later
    const originalExpression = currentExpression;
    
    switch(quirk.type) {
      case 'look_around':
        // Sequence of looking in different directions
        const lookSequence = [
          { x: 2, y: 0 },    // Look right
          { x: 2, y: 1 },    // Look up-right
          { x: 0, y: 1 },    // Look up
          { x: -2, y: 1 },   // Look up-left
          { x: -2, y: 0 },   // Look left
          { x: 0, y: 0 }     // Look center
        ];
        
        lookSequence.forEach((target, index) => {
          setTimeout(() => {
            setLookTarget(target);
          }, index * 500);
        });
        break;
        
      case 'blink_sequence':
        // Quick sequence of blinks
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
          }, i * 300);
        }
        break;
        
      case 'sleepy':
        // Appear sleepy for a moment
        setCurrentExpression(EXPRESSIONS.SLEEPING);
        setTimeout(() => {
          setCurrentExpression(originalExpression);
        }, 3000);
        break;
        
      case 'think_about':
      case 'curious':
      case 'excited':
        // Show expression and say something
        if (quirk.type === 'think_about') {
          setCurrentExpression(EXPRESSIONS.THINKING);
        } else if (quirk.type === 'curious') {
          setCurrentExpression(EXPRESSIONS.SURPRISED);
        } else if (quirk.type === 'excited') {
          setCurrentExpression(EXPRESSIONS.EXCITED);
        }
        
        // Say something if speech is enabled
        if (isSpeechEnabled && quirk.message) {
          speakText(quirk.message);
        }
        
        // Restore original expression after a delay
        setTimeout(() => {
          setCurrentExpression(originalExpression);
        }, 4000);
        break;
        
      default:
        break;
    }
  };
  
  // Initialize speech synthesis
  const initSpeechSynthesis = () => {
    console.log("Initializing speech synthesis...");
    
    if ('speechSynthesis' in window) {
      console.log("Speech synthesis is supported");
      
      // Get available voices
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Sometimes voices aren't loaded immediately
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          console.log("Voices loaded:", voices.length);
          
          // Test speech synthesis
          const testUtterance = new SpeechSynthesisUtterance("Speech system initialized.");
          testUtterance.onstart = () => console.log("Test speech started");
          testUtterance.onend = () => console.log("Test speech ended");
          testUtterance.onerror = (e) => console.error("Test speech error:", e);
          
          if (voices.length > 0) {
            testUtterance.voice = voices[0];
          }
          
          // Uncomment to test - this would speak on initialization
          // window.speechSynthesis.speak(testUtterance);
        };
      } else {
        console.log("Voices already loaded:", voices.length);
      }
      
      // Set reference
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Set up audio context for visualization
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
          console.log("Audio context created");
        }
      } catch (e) {
        console.error('Audio Context not supported:', e);
      }
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  };
  
  // Initialize speech recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setMessageInput(finalTranscript);
            handleSendMessage(finalTranscript);
          }
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          if (isListening) {
            try {
              recognitionInstance.start();
            } catch (e) {
              console.error('Error restarting speech recognition:', e);
            }
          }
        };

        setRecognition(recognitionInstance);
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
      }
    } else {
      console.warn('Speech recognition not supported');
    }
  };
  
  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        
        // Change expression to show it's listening
        setCurrentExpression(EXPRESSIONS.SURPRISED);
        setTimeout(() => {
          setCurrentExpression(EXPRESSIONS.NEUTRAL);
        }, 1000);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };
  
  // Toggle camera tracking
  const toggleCamera = async () => {
    if (isCameraActive) {
      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        
        // In a real implementation, you would use face-api.js here
        // For this example, we'll use a simple placeholder that simulates face tracking
        const faceTrackingSimulator = setInterval(() => {
          if (videoRef.current && isCameraActive) {
            // Simulate face tracking with some realism
            // Movement is based on a combination of random and sinusoidal patterns
            const time = Date.now() / 1000;
            const baseX = Math.sin(time * 0.3) * 0.7;
            const baseY = Math.cos(time * 0.2) * 0.4;
            
            // Add small random component to make it look more natural
            const randomX = (Math.random() * 2 - 1) * 0.1;
            const randomY = (Math.random() * 2 - 1) * 0.1;
            
            setLookTarget({ 
              x: baseX + randomX, 
              y: baseY + randomY
            });
          }
        }, 100);
        
        // Store interval ID to clear later
        return () => clearInterval(faceTrackingSimulator);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access the camera. Please check permissions.');
    }
  };
  
  // Speak text using Web Speech API
  const speakText = (text) => {
    console.log("speakText called with:", text);
    
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not available in this browser");
      return;
    }
    
    if (!isSpeechEnabled) {
      console.log("Speech is disabled, not speaking");
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Sometimes voices aren't loaded immediately
      console.log("No voices available yet, waiting...");
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setVoiceAndSpeak();
      };
    } else {
      setVoiceAndSpeak();
    }
    
    function setVoiceAndSpeak() {
      // Try to find a good voice - prefer Google female voices
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') && voice.name.includes('Female')
      ) || voices.find(voice => voice.name.includes('Female')) || voices[0];
      
      if (preferredVoice) {
        console.log("Using voice:", preferredVoice.name);
        utterance.voice = preferredVoice;
      } else {
        console.log("No specific voice found, using default");
      }
      
      // Apply settings
      utterance.rate = settingsValues.voiceRate;
      utterance.pitch = settingsValues.voicePitch;
      
      // Set up events
      utterance.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
        
        // Generate fake audio visualization data
        const visualizerInterval = setInterval(() => {
          if (isSpeaking) {
            // Create dynamic data based on speaking
            const newData = Array(32).fill(0).map(() => {
              // Create a wave pattern that changes over time
              const time = Date.now() / 1000;
              const base = Math.sin(time * 10) * 50 + 50; // 0-100 range
              return Math.max(5, Math.min(100, base + (Math.random() * 30)));
            });
            setVisualizerData(newData);
          } else {
            clearInterval(visualizerInterval);
          }
        }, 50);
      };
      
      utterance.onend = () => {
        console.log("Speech ended");
        setIsSpeaking(false);
        
        // Reset mouth
        if (mouthRef.current) {
          updateMouthCurve(0, -3, 2, 0.3, 0, Math.PI);
        }
      };
      
      utterance.onerror = (event) => {
        console.error("Speech error:", event);
        setIsSpeaking(false);
      };
      
      // Start speaking
      console.log("Starting speech...");
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Handle mouse movement to control eye direction
  const handleMouseMove = (e) => {
    if (isCameraActive) return; // Don't track mouse if camera tracking is active
    
    // Calculate normalized position (-1 to 1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -((e.clientY / window.innerHeight) * 2 - 1);
    
    setLookTarget({ x, y });
  };
  
  // Track user interaction to control personality quirks
  const handleUserInteraction = useCallback(() => {
    setLastUserInteraction(Date.now());
  }, []);
  
  // Handle sending a message from the input
  const handleSendMessage = (text) => {
    const message = typeof text === 'string' ? text : messageInput;
    if (!message.trim()) return;
    
    console.log("Sending message:", message);
    
    // "Thinking" expression
    setCurrentExpression(EXPRESSIONS.THINKING);
    
    // Send message to parent or handle locally
    if (onSendMessage) {
      console.log("Using parent handler");
      onSendMessage(message);
      // If we're using the parent handler, we need to reset our state
      setMessageInput('');
    } else {
      console.log("Handling message locally");
      // If no parent handler, handle message processing locally
      processBotResponse(message);
      setMessageInput('');
    }
  };
  
  
  const processBotResponse = async (userMessage) => {
    try {
      // Show "thinking" expression immediately when processing starts
      setCurrentExpression(EXPRESSIONS.THINKING);
      
      // Create a user message for display
      const userMsg = {
        sender: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      
      // Add user message to messages list
      setMessages(prev => [...prev, userMsg]);
      
      // Get response from Solaris AI
      let botResponse;
      try {
        // Use your existing API
        const aiContext = {
          messageType: 'userQuery',
          userMessage: userMessage,
          currentTime: new Date().toLocaleTimeString()
        };
        
        console.log("Fetching AI response...");
        const response = await fetchCoachResponse(aiContext);
        botResponse = response.message;
        
        // Log successful response
        console.log("Got AI response:", botResponse);
        
        // Save the message using your utils
        saveDayCoachMessage({
          id: `coach-msg-${Date.now()}`,
          sender: 'coach',
          content: botResponse,
          timestamp: new Date().toISOString(),
          isRead: true
        });
      } catch (error) {
        console.error('Error fetching AI response:', error);
        // Fallback responses if API fails
        const fallbacks = [
          "I'm thinking about that...",
          "That's an interesting point.",
          "Let me consider that for a moment.",
          "I see what you mean.",
          "I'm processing that information."
        ];
        botResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
      
      // Create bot message
      const botMsg = {
        sender: 'coach',
        content: botResponse,
        timestamp: new Date().toISOString()
      };
      
      // Add a slight delay for realism
      setTimeout(() => {
        // Add bot message to messages list
        setMessages(prev => [...prev, botMsg]);
        
        // Log that we're about to speak
        console.log("Speaking response:", botResponse);
        
        // Speak the response - make sure this call works
        if (isSpeechEnabled) {
          console.log("Speech is enabled, speaking text...");
          speakText(botResponse);
        } else {
          console.log("Speech is disabled");
        }
        
        // Change expression based on content
        const newExpression = 
          botResponse.includes('?') ? EXPRESSIONS.CURIOUS :
          botResponse.includes('!') ? EXPRESSIONS.EXCITED :
          botResponse.toLowerCase().includes('sorry') ? EXPRESSIONS.SAD :
          EXPRESSIONS.HAPPY;
        
        console.log("Setting new expression:", newExpression);
        setCurrentExpression(newExpression);
        
        // Return to neutral after a delay
        setTimeout(() => {
          setCurrentExpression(EXPRESSIONS.NEUTRAL);
        }, 5000); // Increased from 3000 to 5000 to make it more noticeable
      }, 1000);
    } catch (error) {
      console.error('Error processing bot response:', error);
    }
  };
  
  // Handle settings changes
  const handleSettingChange = (setting, value) => {
    setSettingsValues({
      ...settingsValues,
      [setting]: value
    });
    
    // Apply setting changes immediately where relevant
    if (setting === 'eyeColor' || setting === 'accentColor') {
      updateVisualSettings();
    }
  };
  
  // Update visual settings (colors, etc.)
  const updateVisualSettings = () => {
    if (!eyesRef.current.left.main || !eyesRef.current.right.main) return;
    
    const eyeColor = new THREE.Color(settingsValues.eyeColor);
    const accentColor = new THREE.Color(settingsValues.accentColor);
    
    // Update eye colors
    eyesRef.current.left.main.material.color = eyeColor;
    eyesRef.current.right.main.material.color = eyeColor;
    
    // In a full implementation, you would update the glow colors too
  };
  
  // Toggle speech output
  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    
    // Cancel any ongoing speech
    if (speechSynthesisRef.current && isSpeechEnabled) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Get recent messages to display in chat
  const recentMessages = showChat ? messages.slice(-6) : [];
  
  return (
    <div 
      className="fixed inset-0 bg-slate-900 text-white flex flex-col z-50 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Hidden video element for camera tracking */}
      <video 
        ref={videoRef} 
        className="hidden" 
        autoPlay 
        playsInline 
        muted
      />
      
      {/* Three.js container */}
      <div 
        ref={containerRef} 
        className="flex-1"
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full ${
            isCameraActive 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors shadow-lg`}
          title={isCameraActive ? "Disable Camera" : "Enable Camera"}
        >
          {isCameraActive ? <CameraOff size={18} /> : <Camera size={18} />}
        </button>
        
        <button
          onClick={toggleSpeech}
          className={`p-3 rounded-full ${
            isSpeechEnabled 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-slate-500 hover:bg-slate-600'
          } transition-colors shadow-lg`}
          title={isSpeechEnabled ? "Mute Solaris" : "Unmute Solaris"}
        >
          {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        
        <button
          onClick={toggleSpeechRecognition}
          className={`p-3 rounded-full ${
            isListening 
              ? 'bg-purple-500 hover:bg-purple-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors shadow-lg`}
          title={isListening ? "Stop Listening" : "Start Listening"}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-full ${
            showSettings 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : 'bg-slate-500 hover:bg-slate-600'
          } transition-colors shadow-lg`}
          title="Settings"
        >
          <Settings size={18} />
        </button>
        
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors shadow-lg"
          title="Exit Robot Mode"
        >
          <Minimize size={18} />
        </button>
      </div>
      
      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-slate-800 p-4 rounded-lg shadow-lg w-64">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Voice Rate</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settingsValues.voiceRate}
                onChange={(e) => handleSettingChange('voiceRate', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Voice Pitch</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settingsValues.voicePitch}
                onChange={(e) => handleSettingChange('voicePitch', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Eye Color</label>
              <input
                type="color"
                value={settingsValues.eyeColor}
                onChange={(e) => handleSettingChange('eyeColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Accent Color</label>
              <input
                type="color"
                value={settingsValues.accentColor}
                onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Personality Level</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settingsValues.personalityLevel}
                onChange={(e) => handleSettingChange('personalityLevel', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Minimal</span>
                <span>Balanced</span>
                <span>Quirky</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat toggle button */}
      <div className="absolute bottom-20 right-4">
        <button
          onClick={() => setShowChat(!showChat)}
          className={`p-3 rounded-full ${
            showChat 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-slate-700 hover:bg-slate-600'
          } transition-colors shadow-lg`}
          title={showChat ? "Hide Chat" : "Show Chat"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
      
      {/* Chat interface (conditionally shown) */}
      {showChat && (
        <div className="absolute bottom-20 right-16 w-80 bg-slate-800/80 backdrop-blur rounded-lg shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="h-64 p-4 overflow-y-auto">
            {recentMessages.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <p>No messages yet.</p>
                <p className="text-sm">Start talking to Solaris!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded-lg max-w-xs ${
                      msg.sender === 'coach' 
                        ? 'bg-blue-600 ml-auto' 
                        : 'bg-slate-700 mr-auto'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Input form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-2 flex gap-2 bg-slate-900/80">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Message Solaris..."
              className="flex-1 px-3 py-2 bg-slate-700 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SolarisRobot;