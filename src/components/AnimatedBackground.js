import React from 'react';
import styled from '@emotion/styled';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  z-index: -1;
  overflow: hidden;
`;

const AnimatedCircle = styled.circle`
  fill: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
  
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(50px, 50px);
    }
    50% {
      transform: translate(0, 100px);
    }
    75% {
      transform: translate(-50px, 50px);
    }
  }
`;

const AnimatedBackground = () => {
  return (
    <BackgroundContainer>
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <AnimatedCircle cx="20" cy="20" r="5" />
        <AnimatedCircle cx="80" cy="30" r="7" style={{ animationDelay: '-5s' }} />
        <AnimatedCircle cx="40" cy="70" r="6" style={{ animationDelay: '-10s' }} />
        <AnimatedCircle cx="60" cy="50" r="4" style={{ animationDelay: '-15s' }} />
      </svg>
    </BackgroundContainer>
  );
};

export default AnimatedBackground;