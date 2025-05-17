import express from 'express';
import {
    addPostToCollection,
    createCollection,
    deleteCollection,
    deletePostFromCollection,
    getAllCollections,
    getCollectionById
} from '../controllers/collectionController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', authenticate, getAllCollections);
router.post('/', authenticate, createCollection);
router.post('/:collectionId/posts', authenticate, addPostToCollection);

router.get('/:collectionId', authenticate, getCollectionById);
router.delete('/:collectionId', authenticate, deleteCollection);
router.delete('/:collectionId/posts/:postId', authenticate, deletePostFromCollection);

export default router;