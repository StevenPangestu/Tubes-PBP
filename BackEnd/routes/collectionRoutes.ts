import express from 'express';
import {
    addPostToCollection,
    createCollection,
    deleteCollection,
    deletePostFromCollection,
    getAllCollections,
    getCollectionById,
    getCollectionsWithPost
} from '../controllers/collectionController';
import { authenticate } from '../middlewares/authMiddleware';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = express.Router();

router.post('/', authenticate, controllerWrapper(createCollection));
router.get('/', authenticate, controllerWrapper(getAllCollections));
router.get('/:collectionId', authenticate, controllerWrapper(getCollectionById));
router.delete('/:collectionId', authenticate, controllerWrapper(deleteCollection));
router.get('/with-posts/:post_id', authenticate, controllerWrapper(getCollectionsWithPost));

router.post('/:collectionId/posts', authenticate, controllerWrapper(addPostToCollection));
router.delete('/:collectionId/posts/:postId', authenticate, controllerWrapper(deletePostFromCollection));

export default router;