import React, { createContext, useState, useEffect, useRef } from 'react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { IconButton, Tooltip } from '@mui/material';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set initial volume to 30%
      
      // Only autoplay if user has unmuted
      if (!isMuted) {
        audioRef.current.play().catch(e => {
          console.log("Autoplay prevented:", e);
          // Most browsers require user interaction before playing audio
        });
      }
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isMuted]);

  // Toggle audio mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
      
      // If unmuting, also play if it wasn't already playing
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute }}>
      {/* Background audio - DDLC theme */}
      <audio 
        ref={audioRef} 
        src="https://ia800404.us.archive.org/23/items/ddlc-ost-part-1/1-01%20Doki%20Doki%20Literature%20Club%21.mp3" 
        loop 
        muted={isMuted}
      />
      
      {/* Audio control button */}
      <Tooltip title={isMuted ? "Enable music" : "Disable music"}>
        <IconButton 
          onClick={toggleMute}
          sx={{ 
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.2)',
            }
          }}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
      </Tooltip>
      
      {children}
    </AudioContext.Provider>
  );
};