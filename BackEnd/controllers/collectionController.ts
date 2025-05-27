import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Collection, CollectionPost, Post, User, sequelize } from '../models';

export const getAllCollections = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const collections = await Collection.findAll({
            where: { user_id: user.user_id },
            attributes: [
                'collection_id',
                'user_id',
                'collection_name',
                'createdAt',
                [
                    sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM "CollectionPost"
                        WHERE "CollectionPost"."collection_id" = "Collection"."collection_id"
                    )`),
                    'posts_count'
                ]
            ],
            group: ['Collection.collection_id'],
            order: [['createdAt', 'DESC']]
        });

        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({
            message: 'Failed to fetch collections',
            error
        });
    }
};

export const createCollection = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { collection_name } = req.body;  // Match with frontend field name

        if (!collection_name || !collection_name.trim()) {
            res.status(400).json({ message: 'Collection title is required' });
            return;
        }

        const collection = await Collection.create({
            collection_id: uuidv4(),
            user_id: user.user_id,
            collection_name: collection_name.trim()
        });

        res.status(201).json({
            message: 'Collection created successfully',
            collection
        });
        return;
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({
            message: 'Failed to create collection',
            error
        });
        return;
    }
};

export const addPostToCollection = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { collectionId } = req.params;
        const { post_id } = req.body;

        const collection = await Collection.findOne({
            where: {
                collection_id: collectionId,
                user_id: user.user_id
            }
        });

        if (!collection) {
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        const existing = await CollectionPost.findOne({
            where: {
                collection_id: collectionId,
                post_id: post_id
            }
        });

        if (existing) {
            res.status(400).json({ message: 'Post already in collection', collectionId })
            return;
        }

        await CollectionPost.create({
            collection_id: collectionId,
            post_id: post_id,
            createdAt: new Date()
        });

        res.json({ message: 'Post added to collection' });
        return;
    } catch (error) {
        console.error('Error adding post to collection:', error);
        res.status(500).json({ message: 'Failed to add post to collection', error });
    }
};

export const getCollectionById = async (req: Request, res: Response) => {
    try {
        const { collectionId } = req.params;

        const collection = await Collection.findOne({
            where: { collection_id: collectionId },
            include: [{
                model: Post,
                through: { attributes: [] },
                include: [{
                    model: User,
                    attributes: ['username', 'profile_picture']
                }]
            }]
        });

        if (!collection) {
            res.status(404).json({ message: 'Collection not found' });
            return;
        }



        res.json(collection);
    } catch (error) {
        console.error('Error getting collection:', error);
        res.status(500).json({ message: 'Failed to get collection' });
    }
};

export const deleteCollection = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { collectionId } = req.params;

        const deleted = await Collection.destroy({
            where: {
                collection_id: collectionId,
                user_id: user.user_id
            }
        });

        if (!deleted) {
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Failed to delete collection', error });
    }
};

export const deletePostFromCollection = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { collectionId, postId } = req.params;

        const collection = await Collection.findOne({
            where: {
                collection_id: collectionId,
                user_id: user.user_id
            }
        });

        if (!collection) {
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        await (collection as any).removePost(postId);
        res.json({ message: 'Post removed from collection' });
    } catch (error) {
        console.error('Error removing post from collection:', error);
        res.status(500).json({ message: 'Failed to remove post from collection', error });
    }
};

export const checkPostInCollections = async (req: Request, res: Response) => {
    try {
        const { post_id } = req.params;
        const user_id = res.locals.user.user_id;

        const collectionPost = await CollectionPost.findOne({
            include: [{
                model: Collection,
                where: { user_id: user_id }
            }],
            where: { post_id: post_id }
        });

        res.json({
            isBookmarked: !!collectionPost // Convert ke boolean
        });
    } catch (error) {
        console.error('Error checking post in collections:', error);
        res.status(500).json({
            message: 'Failed to check post bookmark status'
        });
    }
};

export const getCollectionsWithPost = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { post_id } = req.params;

        const collections = await Collection.findAll({
            include: [{
                model: Post,
                as: 'posts',
                through: {
                    where: { post_id }
                },
                required: true
            }],
            where: { user_id: user.user_id }
        });

        res.json(collections);
    } catch (error) {
        console.error('Error getting collections with post:', error);
        res.status(500).json({
            message: 'Failed to get collections containing the post',
            error
        });
    }
};