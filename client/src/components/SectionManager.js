import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress, Alert, List, ListItem, ListItemText, IconButton, Paper, Divider, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Chip, useMediaQuery, useTheme, Stack } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import { useDarkMode } from '../context/DarkModeContext';

// Helper component for uploading a roster
const RosterUploader = ({ sectionName, courseId, onUpload }) => {
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('rosterFile', file);
    formData.append('sectionName', sectionName);

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/roster`,
        formData,
        { withCredentials: true }
      );
      setMessage(data.message);
      onUpload();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
    setLoading(false);
    setFile(null);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack 
        direction={isMobile ? 'column' : 'row'} 
        spacing={isMobile ? 1.5 : 1.5}
        alignItems={isMobile ? 'stretch' : 'center'}
        sx={{ mb: 2 }}
      >
        <Button
          variant="outlined"
          size={isMobile ? 'medium' : 'small'}
          component="label"
          endIcon={<UploadFileIcon sx={{ fontSize: isMobile ? 20 : 18 }} />}
          fullWidth={isMobile}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            py: isMobile ? 1.2 : 0.75,
            fontSize: isMobile ? '0.9rem' : '0.875rem',
            color: darkMode ? '#60a5fa' : '#0a0a5c',
            borderColor: darkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(10, 10, 92, 0.2)',
            '&:hover': {
              borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
              bgcolor: darkMode ? 'rgba(30, 64, 175, 0.1)' : 'rgba(10, 10, 92, 0.05)',
            },
          }}
        >
          {isMobile ? 'Choose CSV File' : 'Choose CSV'}
          <input type="file" accept=".csv" hidden onChange={handleFileChange} />
        </Button>
        
        {file && (
          <Typography
            variant="body2"
            sx={{
              color: darkMode ? '#e5e7eb' : '#374151',
              fontWeight: 500,
              fontSize: isMobile ? '0.85rem' : '0.875rem',
              px: isMobile ? 1 : 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: isMobile ? 'normal' : 'nowrap',
            }}
          >
            {isMobile && file.name.length > 30 
              ? `${file.name.substring(0, 30)}...` 
              : file.name}
          </Typography>
        )}
        
        <Button
          size={isMobile ? 'medium' : 'small'}
          variant="contained"
          onClick={handleUpload}
          disabled={!file || loading}
          fullWidth={isMobile}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            py: isMobile ? 1.2 : 0.75,
            fontSize: isMobile ? '0.9rem' : '0.875rem',
            background: darkMode
              ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
              : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
            '&:hover': {
              background: darkMode
                ? 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)'
                : 'linear-gradient(135deg, #1e40af 0%, #0a0a5c 100%)',
            },
            '&:disabled': {
              background: darkMode ? '#374151' : '#d1d5db',
            },
          }}
        >
          {loading ? <CircularProgress size={isMobile ? 22 : 20} sx={{ color: '#ffffff' }} /> : 'Upload'}
        </Button>
      </Stack>
      
      {message && (
        <Alert
          severity="success"
          sx={{
            borderRadius: 2,
            fontSize: isMobile ? '0.8rem' : '0.875rem',
            mb: error ? 1 : 0,
            bgcolor: darkMode ? 'rgba(16, 185, 129, 0.1)' : undefined,
            border: darkMode ? '1px solid rgba(16, 185, 129, 0.3)' : undefined,
          }}
        >
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
            fontSize: isMobile ? '0.8rem' : '0.875rem',
            bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : undefined,
            border: darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

// Main Component
const SectionManager = () => {
  const { courseId } = useParams();
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [sectionName, setSectionName] = useState('');
  const [theoryFacultyIds, setTheoryFacultyIds] = useState([]);
  const [labFacultyIds, setLabFacultyIds] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [sectionsRes, facultyRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${courseId}/sections`, { withCredentials: true }),
        axios.get(`http://localhost:5000/api/courses/${courseId}/faculty`, { withCredentials: true })
      ]);
      setSections(sectionsRes.data);
      setFaculty(facultyRes.data);
    } catch (err) {
      setError('Failed to load section data.');
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form submit handler
  const handleCreateSection = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await axios.post(
        `http://localhost:5000/api/courses/${courseId}/sections`,
        { sectionName, theoryFacultyIds, labFacultyIds },
        { withCredentials: true }
      );
      setSectionName('');
      setTheoryFacultyIds([]);
      setLabFacultyIds([]);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create section.');
    }
    setFormLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress
          sx={{
            color: darkMode ? '#60a5fa' : '#0a0a5c',
          }}
          size={isMobile ? 40 : 50}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          m: isMobile ? 2 : 3,
          borderRadius: 2,
          fontSize: isMobile ? '0.85rem' : '0.875rem',
          bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : undefined,
          border: darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1.5, sm: 2.5, md: 4 },
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      {/* 1. Create New Section Form */}
      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 1 : 1.5, 
          mb: isMobile ? 2 : 3,
          px: isMobile ? 0.5 : 0,
        }}>
          <Box
            sx={{
              width: isMobile ? 3 : 4,
              height: isMobile ? 24 : 28,
              background: darkMode
                ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
                : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
              borderRadius: 1,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: darkMode ? '#ffffff' : '#0a0a5c',
              fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
            }}
          >
            Create New Section
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={handleCreateSection}
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: isMobile ? 2 : 3,
            background: darkMode
              ? 'rgba(30, 64, 175, 0.05)'
              : '#f9fafb',
            border: darkMode
              ? '1px solid rgba(96, 165, 250, 0.2)'
              : '1px solid #e5e7eb',
          }}
        >
          <TextField
            label="Section Name (e.g., 'Section 1')"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            required
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            sx={{
              mb: isMobile ? 2 : 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#ffffff',
                fontSize: isMobile ? '0.9rem' : '1rem',
                '& fieldset': {
                  borderColor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb',
                },
                '&:hover fieldset': {
                  borderColor: darkMode ? 'rgba(96, 165, 250, 0.4)' : '#d1d5db',
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
                  borderWidth: isMobile ? '1.5px' : '2px',
                },
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? '#b0b0b0' : '#6b7280',
                fontSize: isMobile ? '0.9rem' : '1rem',
                '&.Mui-focused': {
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: darkMode ? '#ffffff' : '#000000',
              },
            }}
          />

          {/* Theory Faculty Selector */}
          <FormControl
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            sx={{
              mb: isMobile ? 2 : 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#ffffff',
                fontSize: isMobile ? '0.9rem' : '1rem',
                '& fieldset': {
                  borderColor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb',
                },
                '&:hover fieldset': {
                  borderColor: darkMode ? 'rgba(96, 165, 250, 0.4)' : '#d1d5db',
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
                  borderWidth: isMobile ? '1.5px' : '2px',
                },
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? '#b0b0b0' : '#6b7280',
                fontSize: isMobile ? '0.9rem' : '1rem',
                '&.Mui-focused': {
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                },
              },
            }}
          >
            <InputLabel>Theory Faculty</InputLabel>
            <Select
              multiple
              value={theoryFacultyIds}
              onChange={(e) => setTheoryFacultyIds(e.target.value)}
              input={<OutlinedInput label="Theory Faculty" />}
              sx={{
                color: darkMode ? '#ffffff' : '#000000',
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const facultyMember = faculty.find(f => f._id === id);
                    const displayName = isMobile && facultyMember?.name?.length > 15
                      ? `${facultyMember.name.substring(0, 15)}...`
                      : facultyMember?.name || '...';
                    
                    return (
                      <Chip
                        key={id}
                        label={displayName}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          bgcolor: darkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(10, 10, 92, 0.1)',
                          color: darkMode ? '#60a5fa' : '#0a0a5c',
                          fontWeight: 600,
                          fontSize: isMobile ? '0.75rem' : '0.8125rem',
                        }}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: darkMode ? '#2d2d2d' : '#ffffff',
                    borderRadius: 2,
                    mt: 1,
                    maxHeight: isMobile ? 250 : 300,
                    '& .MuiMenuItem-root': {
                      color: darkMode ? '#ffffff' : '#000000',
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      py: isMobile ? 1 : 1.5,
                      '&:hover': {
                        bgcolor: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#f3f4f6',
                      },
                      '&.Mui-selected': {
                        bgcolor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(96, 165, 250, 0.25)' : '#d1d5db',
                        },
                      },
                    },
                  },
                },
              }}
            >
              {faculty.map((f) => (
                <MenuItem key={f._id} value={f._id}>
                  {f.initials ? `[${f.initials}]` : ''} {f.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Lab Faculty Selector */}
          <FormControl
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            sx={{
              mb: isMobile ? 2.5 : 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#ffffff',
                fontSize: isMobile ? '0.9rem' : '1rem',
                '& fieldset': {
                  borderColor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb',
                },
                '&:hover fieldset': {
                  borderColor: darkMode ? 'rgba(96, 165, 250, 0.4)' : '#d1d5db',
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
                  borderWidth: isMobile ? '1.5px' : '2px',
                },
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? '#b0b0b0' : '#6b7280',
                fontSize: isMobile ? '0.9rem' : '1rem',
                '&.Mui-focused': {
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                },
              },
            }}
          >
            <InputLabel>Lab Faculty / TAs</InputLabel>
            <Select
              multiple
              value={labFacultyIds}
              onChange={(e) => setLabFacultyIds(e.target.value)}
              input={<OutlinedInput label="Lab Faculty / TAs" />}
              sx={{
                color: darkMode ? '#ffffff' : '#000000',
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const facultyMember = faculty.find(f => f._id === id);
                    const displayName = isMobile && facultyMember?.name?.length > 15
                      ? `${facultyMember.name.substring(0, 15)}...`
                      : facultyMember?.name || '...';
                    
                    return (
                      <Chip
                        key={id}
                        label={displayName}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          bgcolor: darkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(10, 10, 92, 0.1)',
                          color: darkMode ? '#60a5fa' : '#0a0a5c',
                          fontWeight: 600,
                          fontSize: isMobile ? '0.75rem' : '0.8125rem',
                        }}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: darkMode ? '#2d2d2d' : '#ffffff',
                    borderRadius: 2,
                    mt: 1,
                    maxHeight: isMobile ? 250 : 300,
                    '& .MuiMenuItem-root': {
                      color: darkMode ? '#ffffff' : '#000000',
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      py: isMobile ? 1 : 1.5,
                      '&:hover': {
                        bgcolor: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#f3f4f6',
                      },
                      '&.Mui-selected': {
                        bgcolor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(96, 165, 250, 0.25)' : '#d1d5db',
                        },
                      },
                    },
                  },
                },
              }}
            >
              {faculty.map((f) => (
                <MenuItem key={f._id} value={f._id}>
                  {f.initials ? `[${f.initials}]` : ''} {f.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            disabled={formLoading}
            fullWidth={isMobile}
            sx={{
              px: isMobile ? 3 : 4,
              py: isMobile ? 1.3 : 1.2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: isMobile ? '0.9rem' : '0.95rem',
              borderRadius: 2,
              background: darkMode
                ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
                : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
              boxShadow: darkMode
                ? '0 4px 12px rgba(96, 165, 250, 0.3)'
                : '0 4px 12px rgba(10, 10, 92, 0.25)',
              '&:hover': {
                background: darkMode
                  ? 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)'
                  : 'linear-gradient(135deg, #1e40af 0%, #0a0a5c 100%)',
                boxShadow: darkMode
                  ? '0 6px 16px rgba(96, 165, 250, 0.4)'
                  : '0 6px 16px rgba(10, 10, 92, 0.35)',
              },
              '&:disabled': {
                background: darkMode ? '#374151' : '#d1d5db',
              },
            }}
          >
            {formLoading ? (
              <CircularProgress size={isMobile ? 22 : 24} sx={{ color: '#ffffff' }} />
            ) : (
              isMobile ? 'Create' : 'Create Section'
            )}
          </Button>
        </Paper>
      </Box>

      <Divider
        sx={{
          my: isMobile ? 3 : 4,
          borderColor: darkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(10, 10, 92, 0.1)',
        }}
      />

      {/* 2. Existing Sections List */}
      <Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 1 : 1.5, 
          mb: isMobile ? 2 : 3,
          px: isMobile ? 0.5 : 0,
        }}>
          <Box
            sx={{
              width: isMobile ? 3 : 4,
              height: isMobile ? 24 : 28,
              background: darkMode
                ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
                : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
              borderRadius: 1,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: darkMode ? '#ffffff' : '#0a0a5c',
              fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
            }}
          >
            {isMobile ? 'Sections' : 'Manage Existing Sections'}
          </Typography>
        </Box>

        <List
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: isMobile ? 2 : 3,
            background: darkMode
              ? 'rgba(30, 64, 175, 0.05)'
              : '#f9fafb',
            border: darkMode
              ? '1px solid rgba(96, 165, 250, 0.2)'
              : '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {sections.length === 0 && (
            <ListItem sx={{ py: isMobile ? 2 : 3 }}>
              <ListItemText
                primary="No sections created yet."
                sx={{
                  '& .MuiListItemText-primary': {
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                  },
                }}
              />
            </ListItem>
          )}
          {sections.map((section, index) => (
            <ListItem
              key={section._id}
              divider={index < sections.length - 1}
              sx={{
                py: isMobile ? 2 : 3,
                px: isMobile ? 2 : 3,
                borderColor: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#e5e7eb',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ width: '100%' }}>
                <ListItemText
                  primary={section.name}
                  secondary={
                    isMobile && section.moderators.map(m => m.name).join(', ').length > 40
                      ? `Moderators: ${section.moderators.map(m => m.name).join(', ').substring(0, 40)}...`
                      : `Moderators: ${section.moderators.map(m => m.name).join(', ')}`
                  }
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 700,
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      color: darkMode ? '#ffffff' : '#0a0a5c',
                      mb: 0.5,
                    },
                    '& .MuiListItemText-secondary': {
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                    },
                  }}
                />
                <RosterUploader
                  sectionName={section.sectionName}
                  courseId={courseId}
                  onUpload={fetchData}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default SectionManager;