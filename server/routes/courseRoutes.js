import express from 'express';
import multer from 'multer'; // <-- 1. Import multer
import { 
  createCourse, getMyCourses, getCourseById, getBoardsForCourse ,getCourseFaculty
} from '../controllers/courseController.js';
import { 
  createSection, uploadRoster ,getSections// <-- 2. Import new controllers
} from '../controllers/sectionController.js';
import { 
  isAuth, isFaculty, isCourseMember, isCoordinator // <-- 3. Import isCoordinator
} from '../middleware/authMiddleware.js';

// --- 4. Configure Multer ---
// We'll store the file in memory as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// ... (existing course routes: POST /, GET /, GET /:id, GET /:id/boards) ...
router.post('/', isAuth, isFaculty, createCourse);
router.get('/', isAuth, getMyCourses);
router.get('/:courseId', isAuth, isCourseMember, getCourseById);
router.get('/:courseId/boards', isAuth, isCourseMember, getBoardsForCourse);
router.get('/:courseId/faculty', isAuth, isCoordinator, getCourseFaculty);

router.get('/:courseId/sections', isAuth, isCoordinator, getSections);

// --- 5. Add New Section Routes ---

// Create a new empty section (e.g., "Section 1")
router.post('/:courseId/sections', isAuth, isCoordinator, createSection);
router.post('/:courseId/sections', isAuth, isCoordinator, createSection);
// Upload a roster to a section
router.post(
  '/:courseId/roster', 
  isAuth, 
  isCoordinator, 
  upload.single('rosterFile'), // <-- Multer middleware
  uploadRoster
);

export default router;