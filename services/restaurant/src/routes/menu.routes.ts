import express from 'express'
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import { addMenuItem, getAllItem, deleteMenuItem, toggleMenuItemAvailability } from '../controllers/menu.controller.js';
import uploadFile from '../middlewares/multer.js';

const router = express.Router();
router.post('/new', isAuth, isSeller, uploadFile, addMenuItem);
router.get('/all/:id', isAuth, getAllItem);
router.delete('/:itemId', isAuth, isSeller, deleteMenuItem)
router.put('/status/:itemId', isAuth, isSeller, toggleMenuItemAvailability)

export default router;