import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Container,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Home, 
  School,
  Brightness4Icon,
  Brightness7Icon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { supabase } from '../supabase';
import md5 from 'md5';
import './Navbar.css';

const pages = [
  { name: 'Programs', path: '/programs' },
  { name: 'Decisions', path: '/decisions' },
  { name: 'Applications', path: '/applications' },
  { name: 'Patch Notes', path: '/patch-notes' },
];

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Only use Gravatar if no custom avatar_url is set or if it's empty
        const avatarUrl = data.avatar_url || `https://www.gravatar.com/avatar/${md5(data.email.toLowerCase())}?d=identicon`;
        setProfile({
          ...data,
          avatar_url: avatarUrl
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Add a subscription to profile changes
  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      
      // Subscribe to profile changes
      const subscription = supabase
        .channel('profile_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${currentUser.id}`
          },
          (payload) => {
            console.log('Profile updated:', payload);
            fetchProfile();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser]);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };
  
  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/');
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const menuItems = [
    { text: 'Programs', path: '/programs', icon: <School /> },
    { text: 'Patch Notes', path: '/patch-notes', icon: <Home /> }
  ];

  return (
    <AppBar 
      position="static" 
      sx={{
        background: 'linear-gradient(90deg, #1a237e 0%, #3949ab 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo section */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            REUCafe
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            {/* Mobile menu implementation */}
          </Box>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                sx={{ 
                  my: 2, 
                  mx: 1,
                  color: 'white', 
                  display: 'block',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#FF5722',
                    transform: 'scaleX(0)',
                    transformOrigin: 'bottom right',
                    transition: 'transform 0.3s ease'
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  },
                  '&:hover::after': {
                    transform: 'scaleX(1)',
                    transformOrigin: 'bottom left'
                  }
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Profile section */}
          {currentUser ? (
            <Box sx={{ flexGrow: 0 }}>
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar 
                  src={profile?.avatar_url}
                  alt={profile?.username || currentUser?.email}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
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
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
                variant="outlined"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;