import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box,
  Container,
  Avatar,
  styled
} from '@mui/material';
import { 
  AccountCircle,
  School,
  Assessment,
  Assignment,
  Login,
  PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';

const StyledButton = styled(Button)(({ theme }) => ({
  color: 'white',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: '0%',
    height: '2px',
    background: 'linear-gradient(45deg, #ff3d00, #ff6d00)',
    transition: 'all 0.3s ease',
    transform: 'translateX(-50%)',
  },
  '&:hover::after': {
    width: '100%',
  }
}));

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (currentUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', currentUser.id)
          .single();

        if (data && data.avatar_url) {
          setProfileImage(data.avatar_url);
        }
      }
    };

    fetchProfileImage();
  }, [currentUser]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
        boxShadow: '0 3px 5px 2px rgba(26, 35, 126, 0.3)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold',
                mr: 4
              }}
            >
              REU Cafe
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledButton color="inherit" component={RouterLink} to="/programs">
                <School sx={{ mr: 1 }} />
                Programs
              </StyledButton>
              <StyledButton color="inherit" component={RouterLink} to="/decisions">
                <Assessment sx={{ mr: 1 }} />
                Decisions
              </StyledButton>
              <StyledButton color="inherit" component={RouterLink} to="/applications">
                <Assignment sx={{ mr: 1 }} />
                Applications
              </StyledButton>
              {currentUser?.role === 'admin' && (
                <StyledButton color="inherit" component={RouterLink} to="/admin">
                  Admin Console
                </StyledButton>
              )}
            </Box>
          </Box>

          {currentUser ? (
            <Box sx={{ position: 'relative' }}>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ 
                  padding: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {profileImage ? (
                  <Avatar 
                    src={profileImage} 
                    alt={currentUser.displayName}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      border: '2px solid #ff3d00'
                    }}
                  />
                ) : (
                  <AccountCircle sx={{ fontSize: 40 }} />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  mt: 1,
                  '& .MuiPaper-root': {
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <MenuItem 
                  onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}
                  sx={{ py: 1.5 }}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ py: 1.5 }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <StyledButton
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<Login />}
              >
                Login
              </StyledButton>
              <StyledButton
                color="inherit"
                component={RouterLink}
                to="/signup"
                startIcon={<PersonAdd />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                Sign Up
              </StyledButton>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;