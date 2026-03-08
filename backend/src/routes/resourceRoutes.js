import { Router } from 'express';
import {
  createResource,
  deleteResource,
  getResource,
  getResources,
  updateProgress,
  addNote,
  deleteNote,
} from '../controllers/resourceController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.get('/', protect, getResources);
router.post('/', protect, createResource);
router.get('/:id', protect, getResource);
router.patch('/:id/progress', protect, updateProgress);
router.delete('/:id', protect, deleteResource);
router.post('/:id/notes', protect, addNote);
router.delete('/:id/notes/:noteId', protect, deleteNote);

export default router;