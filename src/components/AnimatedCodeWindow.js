import React, { useEffect, useState } from 'react';
import { Box, styled } from '@mui/material';
import { motion, useDragControls } from 'framer-motion';

const CodeWindow = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1a1a1a',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: -1,
  overflow: 'hidden',
}));

const CodeSnippet = styled(motion.div)(({ theme, color }) => ({
  position: 'absolute',
  padding: '8px 12px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
  color: color,
  cursor: 'grab',
  userSelect: 'none',
  border: `1px solid ${color}`,
  boxShadow: `0 0 10px ${color}`,
  '&:active': {
    cursor: 'grabbing',
  },
}));

const codeSnippets = [
  {
    code: 'function findREUPrograms() {\n  return programs.filter(p => p.type === "REU");\n}',
    color: '#00ff00',
  },
  {
    code: 'const trackApplication = (program) => {\n  setApplications([...applications, program]);\n};',
    color: '#ff3d00',
  },
  {
    code: 'async function submitDecision(programId, decision) {\n  await updateStatus(programId, decision);\n}',
    color: '#2196f3',
  },
  {
    code: 'const calculateDeadline = (date) => {\n  return new Date(date).toLocaleDateString();\n};',
    color: '#ffd700',
  },
  {
    code: 'function connectWithStudents() {\n  return students.filter(s => s.interests === user.interests);\n}',
    color: '#ff1493',
  },
  {
    code: 'const saveProgram = async (program) => {\n  await addToFavorites(program);\n};',
    color: '#00ffff',
  },
  {
    code: 'function trackProgress(application) {\n  return application.status;\n}',
    color: '#ff4500',
  },
  {
    code: 'const updateProfile = (data) => {\n  setUserProfile({...userProfile, ...data});\n};',
    color: '#7fff00',
  },
];

function AnimatedCodeWindow() {
  const [snippets, setSnippets] = useState([]);
  const dragControls = useDragControls();

  useEffect(() => {
    const generateSnippets = () => {
      const newSnippets = codeSnippets.map((snippet, index) => ({
        ...snippet,
        id: index,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 360,
      }));
      setSnippets(newSnippets);
    };

    generateSnippets();
    const interval = setInterval(generateSnippets, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CodeWindow>
      {snippets.map((snippet) => (
        <CodeSnippet
          key={snippet.id}
          color={snippet.color}
          drag
          dragControls={dragControls}
          dragMomentum={false}
          initial={{ x: snippet.x, y: snippet.y, rotate: snippet.rotation }}
          whileDrag={{ scale: 1.1 }}
          animate={{
            x: [snippet.x, snippet.x + 100, snippet.x],
            y: [snippet.y, snippet.y + 50, snippet.y],
            rotate: [snippet.rotation, snippet.rotation + 10, snippet.rotation],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <pre style={{ margin: 0 }}>
            <code>{snippet.code}</code>
          </pre>
        </CodeSnippet>
      ))}
    </CodeWindow>
  );
}

export default AnimatedCodeWindow; 