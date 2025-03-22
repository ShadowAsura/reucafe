import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { ThemeContext } from './contexts/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ReuProvider } from './context/ReuContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/Footer';
import FloatingPatchNotes from './components/FloatingPatchNotes';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import Decisions from './pages/Decisions';
import DecisionDetail from './pages/DecisionDetail';
import Applications from './pages/Applications';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeContext.Provider value={{ theme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ReuProvider>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '100vh'
            }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/programs" element={<Programs />} />
                  <Route path="/programs/:id" element={<ProgramDetail />} />
                  <Route path="/decisions" element={<Decisions />} />
                  <Route path="/decisions/:id" element={<DecisionDetail />} />
                  <Route 
                    path="/applications" 
                    element={
                      <PrivateRoute>
                        <Applications />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } 
                  />
                </Routes>
              </Box>
              <Footer />
              <FloatingPatchNotes />
            </Box>
          </ReuProvider>
        </AuthProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
