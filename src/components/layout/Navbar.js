import React, { useState } from 'react';
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
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  School, 
  Forum, 
  Search, 
  Add,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        REU Cafe
      </Typography>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={RouterLink} to="/results">
          <ListItemIcon>
            <Search />
          </ListItemIcon>
          <ListItemText primary="Results" />
        </ListItem>
        <ListItem button component={RouterLink} to="/programs">
          <ListItemIcon>
            <School />
          </ListItemIcon>
          <ListItemText primary="Programs" />
        </ListItem>
        <ListItem button component={RouterLink} to="/forums">
          <ListItemIcon>
            <Forum />
          </ListItemIcon>
          <ListItemText primary="Forums" />
        </ListItem>
        <ListItem button component={RouterLink} to="/submit-result">
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="Submit Result" />
        </ListItem>
        {!currentUser ? (
          <>
            <ListItem button component={RouterLink} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={RouterLink} to="/register">
              <ListItemText primary="Register" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={RouterLink} to="/profile">
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'inherit',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              REU Cafe
            </Typography>
            
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button color="inherit" component={RouterLink} to="/results">
                Results
              </Button>
              <Button color="inherit" component={RouterLink} to="/programs">
                Programs
              </Button>
              <Button color="inherit" component={RouterLink} to="/forums">
                Forums
              </Button>
              <Button color="inherit" component={RouterLink} to="/submit-result">
                Submit Result
              </Button>
              {currentUser?.role === 'admin' && (
                <Button color="inherit" component={RouterLink} to="/admin">
                  Admin Dashboard
                </Button>
              )}
            </Box>
            {!currentUser ? (
              <Box>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/register">
                  Register
                </Button>
              </Box>
            ) : (
              <Box>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {currentUser.photoURL ? (
                    <Avatar src={currentUser.photoURL} alt={currentUser.displayName} />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
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
                  <MenuItem 
                    onClick={() => {
                      handleClose();
                      navigate('/profile');
                    }}
                  >
                    Profile
                  </MenuItem>
                  {currentUser?.role === 'admin' && (
                    <MenuItem 
                      onClick={() => {
                        handleClose();
                        navigate('/admin');
                      }}
                    >
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;