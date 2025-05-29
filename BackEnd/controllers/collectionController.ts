import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Category, Collection, CollectionPost, Post, sequelize, User } from '../models';

export const getAllCollections = async (req: Request, res: Response) => {
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
    order: [['createdAt', 'DESC']]
  });

  return collections;
};

export const createCollection = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { collection_name } = req.body;

  if (!collection_name || !collection_name.trim()) {
    res.locals.errorCode = 400;
    throw new Error('Collection name is required');
  }

  const collection = await Collection.create({
    collection_id: uuidv4(),
    user_id: user.user_id,
    collection_name: collection_name.trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.locals.statusCode = 201;
  return {
    message: 'Collection created successfully',
    collection
  };
};

export const addPostToCollection = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { collectionId } = req.params;
  const { post_id } = req.body;

  if (!post_id) {
    res.locals.errorCode = 400;
    throw new Error('Post ID is required');
  }

  const collection = await Collection.findOne({
    where: {
      collection_id: collectionId,
      user_id: user.user_id
    }
  });

  if (!collection) {
    res.locals.errorCode = 404;
    throw new Error('Collection not found or unauthorized');
  }

  // Validasi apakah post exists
  const post = await Post.findByPk(post_id);
  if (!post) {
    res.locals.errorCode = 404;
    throw new Error('Post not found');
  }

  const existing = await CollectionPost.findOne({
    where: {
      collection_id: collectionId,
      post_id: post_id
    }
  });

  if (existing) {
    res.locals.errorCode = 400;
    throw new Error('Post already in collection');
  }

  await CollectionPost.create({
    collection_post_id: uuidv4(),
    collection_id: collectionId,
    post_id: post_id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { message: 'Post added to collection successfully' };
};

export const getCollectionById = async (req: Request, res: Response) => {
  const { collectionId } = req.params;
  const user = res.locals.user;

  const collection = await Collection.findOne({
    where: {
      collection_id: collectionId,
      user_id: user.user_id
    },
    include: [{
      model: Post, // langsung gunakan model Post dari relasi BelongsToMany
      through: { attributes: [] }, // hilangkan CollectionPost dari response
      include: [
        {
          model: User,
          attributes: ['user_id', 'username', 'profile_picture']
        },
        {
          model: Category,
          attributes: ['category_id', 'category_name']
        }
      ]
    }]
  });

  if (!collection) {
    res.locals.errorCode = 404;
    throw new Error('Collection not found or unauthorized');
  }

  return collection;
};


export const deleteCollection = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { collectionId } = req.params;

  const deleted = await Collection.destroy({
    where: {
      collection_id: collectionId,
      user_id: user.user_id
    }
  });

  if (!deleted) {
    res.locals.errorCode = 404;
    throw new Error('Collection not found or unauthorized');
  }

  return { message: 'Collection deleted successfully' };
};

export const deletePostFromCollection = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { collectionId, postId } = req.params;

  const collection = await Collection.findOne({
    where: {
      collection_id: collectionId,
      user_id: user.user_id
    }
  });

  if (!collection) {
    res.locals.errorCode = 404;
    throw new Error('Collection not found or unauthorized');
  }

  const deleted = await CollectionPost.destroy({
    where: {
      collection_id: collectionId,
      post_id: postId
    }
  });

  if (!deleted) {
    res.locals.errorCode = 404;
    throw new Error('Post not found in collection');
  }

  return { message: 'Post removed from collection successfully' };
};

export const getCollectionsWithPost = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { post_id } = req.params;

  const collections = await Collection.findAll({
    where: { user_id: user.user_id },
    include: [{
      model: Post,
      where: { post_id },
      required: true,
      through: { attributes: [] }, // agar tidak tampil CollectionPost-nya
    }]
  });

  return collections;
};