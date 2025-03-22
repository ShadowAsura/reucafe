import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, Menu, MenuItem, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import UpdateIcon from '@mui/icons-material/Update';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../supabase';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 12,
    marginTop: theme.spacing(1),
    minWidth: 300,
    maxWidth: 400,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PatchNoteContent = styled(Box)(({ theme }) => ({
  '& p': {
    margin: theme.spacing(1, 0),
  },
  '& ul, & ol': {
    margin: theme.spacing(1, 0),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    margin: theme.spacing(0.5, 0),
  },
  '& code': {
    backgroundColor: theme.palette.grey[100],
    padding: '2px 4px',
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1),
    borderRadius: 4,
    overflowX: 'auto',
  },
}));

const NotificationDot = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.error.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
}));

const FloatingPatchNotes = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [patchNotes, setPatchNotes] = useState([]);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [viewedNotes, setViewedNotes] = useState([]);

  useEffect(() => {
    // Load viewed notes from localStorage
    const viewed = JSON.parse(localStorage.getItem('viewedPatchNotes') || '[]');
    setViewedNotes(viewed);
    
    // Fetch patch notes
    const fetchPatchNotes = async () => {
      const { data, error } = await supabase
        .from('patch_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patch notes:', error);
        return;
      }

      setPatchNotes(data);
      
      // Check for new updates (notes not in viewedNotes)
      const hasNew = data.some(note => !viewed.includes(note.id));
      setHasNewUpdates(hasNew);
    };

    fetchPatchNotes();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewPatchNote = (noteId) => {
    // Add note to viewed notes
    const newViewedNotes = [...viewedNotes, noteId];
    setViewedNotes(newViewedNotes);
    localStorage.setItem('viewedPatchNotes', JSON.stringify(newViewedNotes));
    
    // Check if there are any remaining unviewed notes
    const hasNew = patchNotes.some(note => !newViewedNotes.includes(note.id));
    setHasNewUpdates(hasNew);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Tooltip title={hasNewUpdates ? "New updates available!" : "View patch notes"}>
        <IconButton
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            zIndex: 1000,
          }}
        >
          <UpdateIcon />
          {hasNewUpdates && <NotificationDot />}
        </IconButton>
      </Tooltip>
      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Latest Updates</Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {patchNotes.map((note) => (
          <StyledMenuItem 
            key={note.id}
            onClick={() => handleViewPatchNote(note.id)}
            sx={{ 
              display: 'block',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              {note.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {formatDate(note.created_at)}
            </Typography>
            <PatchNoteContent>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            </PatchNoteContent>
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

export default FloatingPatchNotes; 