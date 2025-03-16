import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Results from './pages/Results';
import SubmitResult from './pages/SubmitResult';
import SuggestProgram from './pages/SuggestProgram';
import PatchNotes from './pages/PatchNotes';
import Profile from './pages/Profile';
import Decisions from './pages/Decisions';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { ThemeContext } from './contexts/ThemeContext';
import { ReuProvider } from './context/ReuContext';
// No need for AudioContext import

// Fresh theme with vibrant colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // Deep blue for primary color
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF5722', // Bright orange for accent color
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ReuProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            overflow: 'auto' // Add this to enable scrolling
          }}>
            <Navbar />
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1,
                overflow: 'auto', // Enable scrolling in the main content area
                paddingBottom: 4 // Add some padding at the bottom
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/programs/:id" element={<ProgramDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/decisions" element={<Decisions />} />
                <Route path="/suggest" element={<SuggestProgram />} />
                <Route path="/results" element={<Results />} />
                <Route path="/submit-result" element={<SubmitResult />} />
                <Route path="/patch-notes" element={<PatchNotes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
            <Footer />
          </div>
        </ThemeProvider>
      </ReuProvider>
    </AuthProvider>
  );
}

export default App;
