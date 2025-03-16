import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Button,
  Chip
} from '@mui/material';
import { Search } from '@mui/icons-material';

// Mock data for development
const mockResults = [
  { id: 1, program: 'Physics REU', institution: 'MIT', field: 'Physics', status: 'Accepted', date: '2023-03-15', gpa: '3.9', year: 'Junior' },
  { id: 2, program: 'Chemistry REU', institution: 'Stanford', field: 'Chemistry', status: 'Rejected', date: '2023-03-10', gpa: '3.7', year: 'Sophomore' },
  { id: 3, program: 'Computer Science REU', institution: 'Carnegie Mellon', field: 'Computer Science', status: 'Waitlisted', date: '2023-03-20', gpa: '3.8', year: 'Junior' },
  { id: 4, program: 'Biology REU', institution: 'Harvard', field: 'Biology', status: 'Accepted', date: '2023-03-05', gpa: '4.0', year: 'Senior' },
  { id: 5, program: 'Mathematics REU', institution: 'Princeton', field: 'Mathematics', status: 'Rejected', date: '2023-03-12', gpa: '3.6', year: 'Sophomore' },
  { id: 6, program: 'Engineering REU', institution: 'Caltech', field: 'Engineering', status: 'Accepted', date: '2023-03-18', gpa: '3.9', year: 'Junior' },
  { id: 7, program: 'Astronomy REU', institution: 'UC Berkeley', field: 'Astronomy', status: 'Waitlisted', date: '2023-03-22', gpa: '3.7', year: 'Senior' },
  { id: 8, program: 'Neuroscience REU', institution: 'Johns Hopkins', field: 'Neuroscience', status: 'Accepted', date: '2023-03-08', gpa: '3.8', year: 'Junior' },
  { id: 9, program: 'Environmental Science REU', institution: 'Yale', field: 'Environmental Science', status: 'Rejected', date: '2023-03-14', gpa: '3.5', year: 'Sophomore' },
  { id: 10, program: 'Psychology REU', institution: 'UCLA', field: 'Psychology', status: 'Accepted', date: '2023-03-25', gpa: '3.9', year: 'Senior' },
];

const fields = [
  'All Fields',
  'Physics',
  'Chemistry',
  'Computer Science',
  'Biology',
  'Mathematics',
  'Engineering',
  'Astronomy',
  'Neuroscience',
  'Environmental Science',
  'Psychology'
];

const statuses = ['All Statuses', 'Accepted', 'Rejected', 'Waitlisted'];
const years = ['All Years', 'Freshman', 'Sophomore', 'Junior', 'Senior'];

function Results() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('All Fields');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [yearFilter, setYearFilter] = useState('All Years');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredResults = mockResults.filter(result => {
    return (
      (searchTerm === '' || 
        result.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.institution.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (fieldFilter === 'All Fields' || result.field === fieldFilter) &&
      (statusFilter === 'All Statuses' || result.status === statusFilter) &&
      (yearFilter === 'All Years' || result.year === yearFilter)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Waitlisted':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          REU Application Results
        </Typography>
        <Typography variant="body1" paragraph>
          Browse through application results shared by other students. Filter by field, status, or search for specific programs.
        </Typography>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Field"
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
              >
                {fields.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Year"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="results table">
            <TableHead>
              <TableRow>
                <TableCell>Program</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell>Field</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>GPA</TableCell>
                <TableCell>Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell component="th" scope="row">
                      {row.program}
                    </TableCell>
                    <TableCell>{row.institution}</TableCell>
                    <TableCell>{row.field}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        color={getStatusColor(row.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.gpa}</TableCell>
                    <TableCell>{row.year}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredResults.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </Container>
  );
}

export default Results;