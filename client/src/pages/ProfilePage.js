import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, Avatar, Grid, Divider, Chip, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

const PROGRAM_OPTIONS = [
  'Undergraduate',
  'Graduate',
  'Joint PhD in the Political Economy of Development',
  'Diploma and Certificates'
];

const DEPARTMENT_OPTIONS = {
  'Undergraduate': [
    'APE', 'ANT', 'ARC', 'BIO', 'Hons', 'BBA', 'ECO', 'MIC', 'MAT', 'LLB',
    'CSE', 'CS', 'ECE', 'GenEd', 'Minor in History', 'BA in English',
    'Bachelor of Science in Physics', 'EEE', 'BA in AELS'
  ],
  'Graduate': [
    'MPH', 'EMBA', 'MS in Bio', 'MSc in CSE', 'MBA', 'MScEEE', 'MEngg. EEE',
    'MSAE', 'MA in English', 'PPDM', 'MA in TESOL', 'MS ECD', 'MDS', 'MAGD',
    'MPSM', 'MSc in Mental Health and Psychosocial Support', 'LL.M.'
  ],
  'Joint PhD in the Political Economy of Development': [],
  'Diploma and Certificates': ['MED']
};

const IdentityCard = ({ user, darkMode }) => {
  const isStudent = user.role === 'student';
  const isFacultyOrAdmin = user.role === 'faculty' || user.role === 'superadmin';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        background: darkMode
          ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.4) 0%, rgba(30, 64, 175, 0.3) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: darkMode
          ? '2px solid rgba(96, 165, 250, 0.3)'
          : '2px solid #e5e7eb',
        boxShadow: darkMode
          ? '0 20px 60px rgba(10, 10, 92, 0.6), 0 0 40px rgba(96, 165, 250, 0.2)'
          : '0 10px 40px rgba(10, 10, 92, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          background: darkMode
            ? 'radial-gradient(circle at top right, rgba(96, 165, 250, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle at top right, rgba(10, 10, 92, 0.05) 0%, transparent 70%)',
          borderRadius: '0 0 0 100%',
        }}
      />

      {/* Header with Avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Avatar
          src={user.profilePicture}
          alt={user.name}
          sx={{
            width: 100,
            height: 100,
            border: darkMode
              ? '4px solid rgba(96, 165, 250, 0.4)'
              : '4px solid #0a0a5c',
            boxShadow: darkMode
              ? '0 8px 24px rgba(10, 10, 92, 0.6)'
              : '0 4px 12px rgba(10, 10, 92, 0.2)',
          }}
        >
          <PersonIcon sx={{ fontSize: 48, color: '#0a0a5c' }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: darkMode
                ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
            }}
          >
            {user.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <EmailIcon
              sx={{
                fontSize: 18,
                color: darkMode ? '#60a5fa' : '#6b7280',
              }}
            />
            <Typography
              sx={{
                color: darkMode ? '#e5e7eb' : '#6b7280',
                fontSize: '0.95rem',
              }}
            >
              {user.email}
            </Typography>
          </Box>
          <Chip
            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            sx={{
              background: darkMode
                ? 'linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)'
                : '#0a0a5c',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.8rem',
              height: 32,
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 3, borderColor: darkMode ? 'rgba(96, 165, 250, 0.3)' : '#e5e7eb' }} />

      {/* Identity Information - Vertical Layout */}
      <Grid container spacing={3}>
        {user.username !== undefined && (
          <Grid item xs={12}>
            <Box>
              <Typography
                sx={{
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Username
              </Typography>
              <Typography
                sx={{
                  color: darkMode ? '#ffffff' : '#1f2937',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                {user.username || '—'}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* STUDENT SPECIFIC FIELDS */}
        {isStudent && (
          <>
            {/* BRACU ID */}
            {user.bracuId && (
              <Grid item xs={12}>
                <Box>
                  <Typography
                    sx={{
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    BRACU ID
                  </Typography>
                  <Typography
                    sx={{
                      color: darkMode ? '#ffffff' : '#1f2937',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    {user.bracuId}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Program(s) for students */}
            {user.programs && user.programs.length > 0 && (
              <Grid item xs={12}>
                <Box>
                  <Typography
                    sx={{
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {user.programs.length > 1 ? 'Programs' : 'Program'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.programs.map((program, index) => (
                      <Chip
                        key={index}
                        label={program}
                        sx={{
                          bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#f3f4f6',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          fontWeight: 500,
                          border: darkMode ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid #e5e7eb',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Department(s) for students */}
            {user.departments && user.departments.length > 0 && (
              <Grid item xs={12}>
                <Box>
                  <Typography
                    sx={{
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {user.departments.length > 1 ? 'Departments' : 'Department'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.departments.map((dept, index) => (
                      <Chip
                        key={index}
                        label={dept}
                        sx={{
                          bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#f3f4f6',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          fontWeight: 500,
                          border: darkMode ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid #e5e7eb',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </>
        )}

        {/* FACULTY/ADMIN SPECIFIC FIELDS */}
        {isFacultyOrAdmin && (
          <>
            {/* Initials */}
            {user.initials && (
              <Grid item xs={12}>
                <Box>
                  <Typography
                    sx={{
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Initials
                  </Typography>
                  <Typography
                    sx={{
                      color: darkMode ? '#ffffff' : '#1f2937',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    {user.initials}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Programs for faculty/admin */}
            {user.programs && user.programs.length > 0 && (
              <Grid item xs={12}>
                <Box>
                  <Typography
                    sx={{
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {user.programs.length > 1 ? 'Programs' : 'Program'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.programs.map((program, index) => (
                      <Chip
                        key={index}
                        label={program}
                        sx={{
                          bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#f3f4f6',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          fontWeight: 500,
                          border: darkMode ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid #e5e7eb',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Departments for faculty/admin */}
            {user.departments && user.departments.length > 0 && (
              <Grid item xs={12}>
                <Box>
                  <Typography
                    sx={{
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {user.departments.length > 1 ? 'Departments' : 'Department'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.departments.map((dept, index) => (
                      <Chip
                        key={index}
                        label={dept}
                        sx={{
                          bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#f3f4f6',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          fontWeight: 500,
                          border: darkMode ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid #e5e7eb',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </>
        )}

        {/* Legacy single program/department support */}
        {user.program && !user.programs && (
          <Grid item xs={12}>
            <Box>
              <Typography
                sx={{
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Program
              </Typography>
              <Typography
                sx={{
                  color: darkMode ? '#ffffff' : '#1f2937',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                {user.program}
              </Typography>
            </Box>
          </Grid>
        )}

        {user.department && !user.departments && (
          <Grid item xs={12}>
            <Box>
              <Typography
                sx={{
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Department
              </Typography>
              <Typography
                sx={{
                  color: darkMode ? '#ffffff' : '#1f2937',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                {user.department}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { darkMode } = useDarkMode();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bracuId: '',
    initials: '',
    programCount: 1,
    programs: [''],
    departmentCount: 1,
    departments: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'superadmin';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bracuId: user.bracuId || '',
        initials: user.initials || '',
        programCount: user.programs?.length || 1,
        programs: user.programs?.length ? user.programs : [''],
        departmentCount: user.departments?.length || 1,
        departments: user.departments?.length ? user.departments : [''],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProgramCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    const newPrograms = Array(count).fill('').map((_, i) => formData.programs[i] || '');
    setFormData({ ...formData, programCount: count, programs: newPrograms });
  };

  const handleDepartmentCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    const newDepartments = Array(count).fill('').map((_, i) => formData.departments[i] || '');
    setFormData({ ...formData, departmentCount: count, departments: newDepartments });
  };

  const handleProgramChange = (index, value) => {
    const newPrograms = [...formData.programs];
    newPrograms[index] = value;
    setFormData({ ...formData, programs: newPrograms });
  };

  const handleDepartmentChange = (index, value) => {
    const newDepartments = [...formData.departments];
    newDepartments[index] = value;
    setFormData({ ...formData, departments: newDepartments });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        username: user.username || '',
        bracuId: user.bracuId || '',
        initials: user.initials || '',
        programCount: user.programs?.length || 1,
        programs: user.programs?.length ? user.programs : [''],
        departmentCount: user.departments?.length || 1,
        departments: user.departments?.length ? user.departments : [''],
      });
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Separate data structure for students vs faculty/admin
    let updateData = {};

    if (formData.username && formData.username.trim() !== '') {
      updateData.username = formData.username.trim();
    }

    if (isStudent) {
      // Student-specific fields
      updateData.bracuId = formData.bracuId;
      updateData.programs = formData.programs.filter(p => p);
      updateData.departments = formData.departments.filter(d => d);
    } else if (isFacultyOrAdmin) {
      // Faculty/Admin-specific fields
      updateData.initials = formData.initials;
      updateData.programs = formData.programs.filter(p => p);
      updateData.departments = formData.departments.filter(d => d);
    }

    try {
      const { data: updatedUser } = await axios.put('http://localhost:5000/api/users/me', updateData, {
        withCredentials: true,
      });
      setUser(prev => ({ ...prev, ...updatedUser }));
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          background: darkMode
            ? 'radial-gradient(ellipse at top, #0a0a5c 0%, #000000 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        <CircularProgress sx={{ color: darkMode ? '#60a5fa' : '#0a0a5c' }} size={50} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: 'calc(100vh - 64px)',
        background: darkMode ? '#000000' : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {darkMode && (
        <>
          <Box sx={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30, 64, 175, 0.15) 0%, transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none', filter: 'blur(80px)' }} />
          <Box sx={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(10, 10, 92, 0.2) 0%, transparent 70%)', bottom: '-100px', left: '-80px', pointerEvents: 'none', filter: 'blur(80px)' }} />
        </>
      )}

      <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', gap: 2, maxWidth: 900, mx: 'auto', position: 'relative', zIndex: 1 }}>
        <Box sx={{ width: { xs: 4, sm: 5 }, height: { xs: 32, sm: 40 }, background: darkMode ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)' : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)', borderRadius: 1, boxShadow: darkMode ? '0 4px 12px rgba(96, 165, 250, 0.3)' : '0 2px 8px rgba(10, 10, 92, 0.15)' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, background: darkMode ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)' : '#0a0a5c', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, letterSpacing: '-0.02em' }}>
          My Profile
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', position: 'relative', zIndex: 1 }}>
        {!isEditing ? (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit} sx={{ py: 1, px: 2.5, fontWeight: 600, textTransform: 'none', color: darkMode ? '#60a5fa' : '#0a0a5c', borderColor: darkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(10, 10, 92, 0.2)', borderRadius: 2, '&:hover': { borderColor: darkMode ? '#60a5fa' : '#0a0a5c', bgcolor: darkMode ? 'rgba(30, 64, 175, 0.1)' : 'rgba(10, 10, 92, 0.05)' } }}>
                Edit Profile
              </Button>
            </Box>
            <IdentityCard user={user} darkMode={darkMode} />
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3, md: 4 }, mb: 3, borderRadius: 4, background: darkMode ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)' : '#ffffff', backdropFilter: 'blur(20px)', border: darkMode ? '1.5px solid rgba(30, 64, 175, 0.3)' : '1px solid #e5e7eb', boxShadow: darkMode ? '0 30px 90px rgba(10, 10, 92, 0.6)' : '0 20px 60px rgba(10, 10, 92, 0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#60a5fa' : '#0a0a5c', mb: 2.5 }}>
              Edit Profile Information
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>
                {/* Username - Full width, shown for everyone */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter your username"
                    helperText="Optional"
                    InputProps={{
                      startAdornment: <AccountCircleIcon sx={{ mr: 1, color: darkMode ? '#60a5fa' : '#6b7280', fontSize: 20 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f9fafb',
                        color: darkMode ? '#ffffff' : '#000000',
                        '& fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb' },
                        '&:hover fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.5)' : '#d1d5db' },
                        '&.Mui-focused fieldset': { borderColor: darkMode ? '#60a5fa' : '#0a0a5c', borderWidth: '2px' }
                      }
                    }}
                  />
                </Grid>

                {/* === STUDENT-SPECIFIC FIELDS === */}
                {isStudent && (
                  <>
                    {/* BRACU ID for students only */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="BRACU ID"
                        name="bracuId"
                        value={formData.bracuId}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter your BRACU ID"
                        helperText="Optional"
                        InputProps={{
                          startAdornment: <BadgeIcon sx={{ mr: 1, color: darkMode ? '#60a5fa' : '#6b7280', fontSize: 20 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f9fafb',
                            color: darkMode ? '#ffffff' : '#000000',
                            '& fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb' },
                            '&:hover fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.5)' : '#d1d5db' },
                            '&.Mui-focused fieldset': { borderColor: darkMode ? '#60a5fa' : '#0a0a5c', borderWidth: '2px' }
                          }
                        }}
                      />
                    </Grid>

                    {/* Program for students */}
                    <Select
                      name="program"
                      value={formData.programs[0] || ''}
                      onChange={(e) => handleProgramChange(0, e.target.value)}
                      label="Program"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <em>Enter Program</em>
                      </MenuItem>

                      {PROGRAM_OPTIONS.map((program) => (
                        <MenuItem key={program} value={program}>
                          {program}
                        </MenuItem>
                      ))}
                    </Select>

                    {/* Department for students */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={loading || !formData.programs[0]}>
                        <InputLabel>Department</InputLabel>
                        <Select
                          name="department"
                          value={formData.departments[0] || ''}
                          onChange={(e) => handleDepartmentChange(0, e.target.value)}
                          label="Department"
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            <em>Enter Department</em>
                          </MenuItem>

                          {(DEPARTMENT_OPTIONS[formData.programs[0]] || []).map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{!formData.programs[0] ? 'Select program first' : 'Optional'}</FormHelperText>
                      </FormControl>
                    </Grid>
                  </>
                )}

                {/* === FACULTY/ADMIN-SPECIFIC FIELDS === */}
                {isFacultyOrAdmin && (
                  <>
                    {/* Initials for faculty/admin only */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Initials"
                        name="initials"
                        value={formData.initials}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., SBB"
                        helperText="Optional - 3 characters max"
                        inputProps={{ maxLength: 3 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f9fafb',
                            color: darkMode ? '#ffffff' : '#000000',
                            '& fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb' },
                            '&:hover fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.5)' : '#d1d5db' },
                            '&.Mui-focused fieldset': { borderColor: darkMode ? '#60a5fa' : '#0a0a5c', borderWidth: '2px' }
                          }
                        }}
                      />
                    </Grid>

                    {/* Program count for faculty/admin */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="How many programs?"
                        value={formData.programCount}
                        onChange={handleProgramCountChange}
                        disabled={loading}
                        inputProps={{ min: 1, max: 10 }}
                        helperText="Select number of programs (1-10)"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f9fafb',
                            color: darkMode ? '#ffffff' : '#000000',
                            '& fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb' },
                            '&:hover fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.5)' : '#d1d5db' },
                            '&.Mui-focused fieldset': { borderColor: darkMode ? '#60a5fa' : '#0a0a5c', borderWidth: '2px' }
                          }
                        }}
                      />
                    </Grid>

                    {/* Program dropdowns for faculty/admin */}
                    {formData.programs.map((program, index) => (
                      <Grid item xs={12} sm={6} key={`program-${index}`}>
                        <FormControl fullWidth disabled={loading}>
                          <InputLabel>Program {index + 1}</InputLabel>
                          <Select
                            value={program}
                            onChange={(e) => handleProgramChange(index, e.target.value)}
                            label={`Program ${index + 1}`}
                            startAdornment={<SchoolIcon sx={{ ml: 1, mr: 1, color: darkMode ? '#60a5fa' : '#6b7280', fontSize: 20 }} />}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: darkMode ? 'rgba(2, 6, 23, 0.95)' : '#ffffff',
                                  backdropFilter: 'blur(10px)',
                                  border: darkMode ? '1px solid rgba(30, 64, 175, 0.3)' : '1px solid #e5e7eb',
                                  borderRadius: 2,
                                  boxShadow: darkMode ? '0 8px 24px rgba(10, 10, 92, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                  maxHeight: 300,
                                  '& .MuiMenuItem-root': {
                                    color: darkMode ? '#ffffff' : '#000000',
                                    '&:hover': { bgcolor: darkMode ? 'rgba(30, 64, 175, 0.2)' : '#f3f4f6' },
                                    '&.Mui-selected': {
                                      bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb',
                                      '&:hover': { bgcolor: darkMode ? 'rgba(30, 64, 175, 0.4)' : '#d1d5db' }
                                    }
                                  }
                                }
                              }
                            }}
                            sx={{
                              borderRadius: 2,
                              bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f9fafb',
                              color: darkMode ? '#ffffff' : '#000000',
                              '& fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb' },
                              '&:hover fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.5)' : '#d1d5db' },
                              '&.Mui-focused fieldset': { borderColor: darkMode ? '#60a5fa' : '#0a0a5c', borderWidth: '2px' }
                            }}
                          >
                            {PROGRAM_OPTIONS.map((prog) => (
                              <MenuItem key={prog} value={prog}>{prog}</MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>Optional</FormHelperText>
                        </FormControl>
                      </Grid>
                    ))}

                    {/* Department count for faculty/admin */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="How many departments?"
                        value={formData.departmentCount}
                        onChange={handleDepartmentCountChange}
                        disabled={loading}
                        inputProps={{ min: 1, max: 10 }}
                        helperText="Select number of departments (1-10)"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f9fafb',
                            color: darkMode ? '#ffffff' : '#000000',
                            '& fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb' },
                            '&:hover fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.5)' : '#d1d5db' },
                            '&.Mui-focused fieldset': { borderColor: darkMode ? '#60a5fa' : '#0a0a5c', borderWidth: '2px' }
                          }
                        }}
                      />
                    </Grid>

                    {/* Department dropdowns for faculty/admin */}
                    {formData.departments.map((dept, index) => (
                      <Grid item xs={12} sm={6} key={`dept-${index}`}>
                        <FormControl fullWidth disabled={loading}>
                          <InputLabel>Department {index + 1}</InputLabel>
                          <Select
                            value={dept}
                            onChange={(e) => handleDepartmentChange(index, e.target.value)}
                            label={`Department ${index + 1}`}
                            startAdornment={<BusinessIcon sx={{ ml: 1, mr: 1, color: darkMode ? '#60a5fa' : '#6b7280', fontSize: 20 }} />}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: darkMode ? 'rgba(2, 6, 23, 0.95)' : '#ffffff',
                                  backdropFilter: 'blur(10px)',
                                  border: darkMode ? '1px solid rgba(30, 64, 175, 0.3)' : '1px solid #e5e7eb',
                                  borderRadius: 2,
                                  boxShadow: darkMode ? '0 8px 24px rgba(10, 10, 92, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                  maxHeight: 300,
                                  '& .MuiMenuItem-root': {
                                    color: darkMode ? '#ffffff' : '#000000',
                                    '&:hover': { bgcolor: darkMode ? 'rgba(30, 64, 175, 0.2)' : '#f3f4f6' },
                                    '&.Mui-selected': {
                                      bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb',
                                      '&:hover': { bgcolor: darkMode ? 'rgba(30, 64, 175, 0.4)' : '#d1d5db' }
                                    }
                                  }
                                }
                              }
                            }}
                            sx={{
                              borderRadius: 2,
                              bgcolor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f9fafb',
                              color: darkMode ? '#ffffff' : '#000000',
                              '& fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.3)' : '#e5e7eb' },
                              '&:hover fieldset': { borderColor: darkMode ? 'rgba(30, 64, 175, 0.5)' : '#d1d5db' },
                              '&.Mui-focused fieldset': { borderColor: darkMode ? '#60a5fa' : '#0a0a5c', borderWidth: '2px' }
                            }}
                          >
                            {Array.from(new Set(Object.values(DEPARTMENT_OPTIONS).flat())).sort().map((department) => (
                              <MenuItem key={department} value={department}>{department}</MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>Optional</FormHelperText>
                        </FormControl>
                      </Grid>
                    ))}
                  </>
                )}
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: darkMode ? '#b0b0b0' : '#6b7280',
                    borderColor: darkMode ? '#404040' : '#d1d5db',
                    borderRadius: 2,
                    minWidth: 120,
                    '&:hover': {
                      borderColor: darkMode ? '#525252' : '#9ca3af',
                      bgcolor: darkMode ? '#2d2d2d' : '#f9fafb'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    bgcolor: darkMode ? 'linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)' : '#0a0a5c',
                    color: 'white',
                    borderRadius: 2,
                    boxShadow: darkMode ? '0 4px 12px rgba(96, 165, 250, 0.3)' : '0 4px 12px rgba(10, 10, 92, 0.25)',
                    minWidth: 140,
                    '&:hover': {
                      bgcolor: darkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' : '#0d0d7a',
                      boxShadow: darkMode ? '0 6px 16px rgba(96, 165, 250, 0.4)' : '0 6px 16px rgba(10, 10, 92, 0.35)',
                      transform: 'translateY(-2px)'
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&.Mui-disabled': {
                      bgcolor: darkMode ? '#404040' : '#d1d5db',
                      color: darkMode ? '#737373' : '#9ca3af'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ProfilePage;