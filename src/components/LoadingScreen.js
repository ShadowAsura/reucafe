import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function LoadingScreen({ finishLoading }) {
  const theme = useTheme();
  const { darkMode } = useContext(ThemeContext);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      finishLoading();
    }, 2500); // Total loading time in ms
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress((oldProgress) => {
        const newProgress = Math.min(oldProgress + Math.random() * 10, 100);
        return newProgress;
      });
    }, 200);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [finishLoading]);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        zIndex: 9999,
      }}
    >
      <Box sx={{ position: 'relative', mb: 4 }}>
        <CircularProgress 
          size={100} 
          thickness={4} 
          color="primary" 
          variant="determinate" 
          value={loadingProgress} 
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h5"
            component="div"
            color="text.primary"
          >{`${Math.round(loadingProgress)}%`}</Typography>
        </Box>
      </Box>
      
      <Fade in={true} timeout={1000}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            color: darkMode ? '#fff' : '#333',
            fontFamily: 'monospace',
          }}
        >
          REU Cafe
        </Typography>
      </Fade>
      
      <Typography
        variant="body1"
        sx={{
          color: darkMode ? '#ccc' : '#555',
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        Connecting undergraduates with research opportunities...
      </Typography>
    </Box>
  );
}

export default LoadingScreen;