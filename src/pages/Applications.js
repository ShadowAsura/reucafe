import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Zoom,
  Fade,
  Chip
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Add, Edit, Delete, CalendarToday } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function Applications() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(applications);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setApplications(items);
  };

  const [formData, setFormData] = useState({
    program_name: '',
    university: '',
    deadline: null,
    status: 'Not Started',
    decision: 'Pending',
    notes: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
      
      if (window.history.state && window.history.state.usr && window.history.state.usr.program) {
        const programData = window.history.state.usr.program;
        setFormData({
          program_name: programData.program_name || '',
          university: programData.university || '',
          deadline: programData.deadline || null,
          status: programData.status || 'Not Started',
          decision: programData.decision || 'Pending',
          notes: programData.notes || ''
        });
        setOpenDialog(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [currentUser]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (application = null) => {
    if (application) {
      setEditingId(application.id);
      setFormData({
        program_name: application.program_name,
        university: application.university,
        deadline: application.deadline,
        status: application.status,
        decision: application.decision,
        notes: application.notes
      });
    } else {
      setEditingId(null);
      setFormData({
        program_name: '',
        university: '',
        deadline: null,
        status: 'Not Started',
        decision: 'Pending',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('applications')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('applications')
          .insert([
            {
              ...formData,
              user_id: currentUser.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        if (error) throw error;
      }
      handleCloseDialog();
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  return (
    <Container maxWidth={false} sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      py: 4,
      px: 4,
      backgroundColor: 'background.default'
    }}>
      <Box sx={{ flex: 1, width: '100%' }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          background: 'linear-gradient(45deg, #1a237e 30%, #ff3d00 90%)',
          p: 3,
          borderRadius: 2,
          color: 'white'
        }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Application Tracker
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: '#2196F3',
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
            }}
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Application
          </Button>
        </Box>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="applications">
            {(provided) => (
              <TableContainer component={Paper} sx={{
                width: '100%',
                mt: 3,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3
              }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ 
                      background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                      '& th': { color: 'white', fontWeight: 'bold' }
                    }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Program Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>University</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Deadline</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Decision</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Notes</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {applications.map((app, index) => (
                      <Draggable key={app.id} draggableId={app.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <TableRow 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(26, 35, 126, 0.04)',
                                transition: 'all 0.3s ease'
                              },
                              transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
                              boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0, 0, 0, 0.1)' : 'none',
                              transition: 'all 0.2s ease',
                              cursor: 'grab',
                              '&:active': { cursor: 'grabbing' }
                            }}
                          >
                            <TableCell sx={{ color: '#1976d2', fontWeight: 500 }}>{app.program_name}</TableCell>
                            <TableCell>{app.university}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday sx={{ fontSize: 16, color: '#757575' }} />
                                {new Date(app.deadline).toLocaleDateString()}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={app.status}
                                color={app.status === 'Not Started' ? 'default' :
                                       app.status === 'In Progress' ? 'primary' :
                                       app.status === 'Completed' ? 'success' : 'warning'}
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={app.decision}
                                color={app.decision === 'Pending' ? 'default' :
                                       app.decision === 'Accepted' ? 'success' :
                                       app.decision === 'Rejected' ? 'error' : 'warning'}
                                variant="outlined"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell>{app.notes}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    onClick={() => handleOpenDialog(app)}
                                    sx={{ 
                                      color: '#1976d2',
                                      '&:hover': { backgroundColor: '#e3f2fd' }
                                    }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    onClick={() => handleDelete(app.id)}
                                    sx={{ 
                                      color: '#d32f2f',
                                      '&:hover': { backgroundColor: '#ffebee' }
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Droppable>
        </DragDropContext>

        <Dialog
          open={openDialog} 
          onClose={handleCloseDialog}
          TransitionComponent={Fade}
          transitionDuration={300}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              minWidth: '500px'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #1a237e 30%, #ff3d00 90%)',
            color: 'white',
            py: 2
          }}>
            {editingId ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Program Name"
                fullWidth
                value={formData.program_name}
                onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="University"
                fullWidth
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                sx={{ mb: 2 }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
                <DatePicker
                  label="Deadline"
                  value={formData.deadline ? new Date(formData.deadline) : null}
                  onChange={(newValue) => {
                    if (newValue && !isNaN(newValue.getTime())) {
                      setFormData({ ...formData, deadline: newValue });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          '&:hover fieldset': {
                            borderColor: '#1a237e'
                          }
                        }
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                <InputLabel>Decision</InputLabel>
                <Select
                  value={formData.decision}
                  label="Decision"
                  onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Accepted">Accepted</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Waitlisted">Waitlisted</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: '#757575',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #1a237e 30%, #ff3d00 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0d47a1 30%, #dd2c00 90%)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 5px 2px rgba(26, 35, 126, 0.3)'
              }}
            >
              {editingId ? 'Save Changes' : 'Add Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Applications;