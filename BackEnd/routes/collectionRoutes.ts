import express from 'express';
import {
    addPostToCollection,
    checkPostInCollections,
    createCollection,
    deleteCollection,
    deletePostFromCollection,
    getAllCollections,
    getCollectionById,
    getCollectionsWithPost
} from '../controllers/collectionController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/check-post/:post_id', authenticate, checkPostInCollections);

router.post('/', authenticate, createCollection);
router.get('/', authenticate, getAllCollections);
router.get('/:collectionId', authenticate, getCollectionById);
router.delete('/:collectionId', authenticate, deleteCollection);
router.get('/with-posts/:post_id', authenticate, getCollectionsWithPost)


router.post('/:collectionId/posts', authenticate, addPostToCollection);
router.delete('/:collectionId/posts/:postId', authenticate, deletePostFromCollection);

export default router;