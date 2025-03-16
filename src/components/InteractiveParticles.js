import React, { useContext } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { ThemeContext } from '../contexts/ThemeContext';

const InteractiveParticles = () => {
  const { darkMode } = useContext(ThemeContext);

  const particlesInit = async (main) => {
    try {
      await loadFull(main);
    } catch (error) {
      console.error("Error initializing particles:", error);
    }
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1
        },
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
              parallax: {
                enable: true,
                force: 60,
                smooth: 10
              }
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 150,
              duration: 0.4,
            },
            grab: {
              distance: 400,
              links: {
                opacity: 1
              }
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 0.8
            }
          },
        },
        particles: {
          color: {
            value: darkMode ? "#1a237e" : "#283593", // Ultramarine blue shades
          },
          links: {
            color: darkMode ? "#3949ab" : "#303f9f", // Ultramarine blue shades
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
            triangles: {
              enable: true,
              opacity: 0.1
            }
          },
          collisions: {
            enable: true,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 2,
            straight: false,
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            }
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.5,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          shape: {
            type: ["circle", "triangle", "polygon"],
          },
          size: {
            value: { min: 1, max: 5 },
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.1,
              sync: false
            }
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default InteractiveParticles;