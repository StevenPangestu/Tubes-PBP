import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Collection, Post, sequelize } from '../models';

export const getAllCollections = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const collections = await Collection.findAll({
            where: { user_id: user.user_id },
            include: [{
                model: Post,
                through: { attributes: [] },
            }],
            attributes: {
                include: [
                    [sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM "collection_posts"
                        WHERE "collection_posts"."collection_id" = "Collection"."collection_id"
                    )`), 'posts_count']
                ]
            },
            group: ['Collection.collection_id', 'posts.post_id']
        });

        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ message: 'Failed to fetch collections', error });
    }
};

export const createCollection = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { collection_name } = req.body;

        if (!collection_name) {
            res.status(400).json({ message: 'Collection name is required' });
            return;
        }

        const collection = await Collection.create({
            collection_id: uuidv4(),
            collection_name,
            user_id: user.user_id
        });

        res.status(201).json(collection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: 'Failed to create collection', error });
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

        await (collection as any).addPost(post_id);
        res.json({ message: 'Post added to collection' });
    } catch (error) {
        console.error('Error adding post to collection:', error);
        res.status(500).json({ message: 'Failed to add post to collection', error });
    }
};

export const getCollectionById = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { collectionId } = req.params;

        const collection = await Collection.findOne({
            where: { 
                collection_id: collectionId,
                user_id: user.user_id 
            },
            include: [{
                model: Post,
                through: { attributes: [] }
            }]
        });

        if (!collection) {
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        res.json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ message: 'Failed to fetch collection', error });
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