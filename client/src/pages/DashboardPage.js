import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Box, CircularProgress,
  Alert, Grid, Card, CardContent, CardActionArea
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreateCourseModal from '../components/CreateCourseModal';
import { Link as RouterLink } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Function to fetch courses
  const fetchCourses = async () => {
    try {
      // We must send credentials (cookies) with our request
      const { data } = await axios.get('http://localhost:5000/api/courses', {
        withCredentials: true,
      });
      setCourses(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses.');
    }
    setLoading(false);
  };

  // Fetch courses when the page loads
  useEffect(() => {
    fetchCourses();
  }, []);

  // Function to handle course creation
  const handleCreateCourse = async (formData) => {
    // This function is passed to the modal
    await axios.post('http://localhost:5000/api/courses', formData, {
      withCredentials: true,
    });

    // After creating, refresh the list
    fetchCourses(); 
  };

  const isFaculty = user.role === 'faculty' || user.role === 'superadmin';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Courses</Typography>

        {/* Only show "Create" button if user is faculty */}
        {isFaculty && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
          >
            Create New Course
          </Button>
        )}
      </Box>

      {/* --- Loading and Error States --- */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {/* --- Courses List --- */}
      {!loading && !error && (
        <Grid container spacing={3}>
          {courses.length === 0 ? (
            <Typography sx={{ ml: 3, mt: 2 }}>
              You are not enrolled in any courses yet.
            </Typography>
          ) : (
            courses.map((course) => (
        <Grid item xs={12} md={6} lg={4} key={course._id}>
          {/* --- 3. Wrap Card in Link and ActionArea --- */}
          <Card sx={{ height: '100%' }}>
            <CardActionArea 
              component={RouterLink} 
              to={`/course/${course._id}`}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Typography variant="h6">{course.title}</Typography>
                <Typography color="text.secondary">{course.code}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{course.semester}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))
    )}
  </Grid>
)}

      {/* --- The Modal --- */}
      {isFaculty && (
        <CreateCourseModal
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          onCourseCreated={handleCreateCourse}
        />
      )}
    </Box>
  );
};

export default DashboardPage;