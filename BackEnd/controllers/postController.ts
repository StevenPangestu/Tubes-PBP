import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Category } from "../models/Category";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { User } from "../models/User";

// GET /posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = page * limit;

    const posts = await Post.findAll({
      include: [User, Category],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const formattedPosts = posts.map(post => {
      const postJson = post.toJSON() as any;

      if (postJson.user?.profile_picture && !postJson.user.profile_picture.startsWith('http')) {
        postJson.user.profile_picture = `${hostUrl}${postJson.user.profile_picture}`;
      }

      return postJson;
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: "Failed to get posts", error });
  }
};


// POST /posts
export const createPost = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { caption, category_id } = req.body;

    if (!req.file || !caption || !category_id) {
        res.status(400).json({ message: "Missing fields" });
        return;
    }

    const image_url = `/uploads/${req.file.filename}`;

    const post = await Post.create({
      post_id: uuidv4(),
      user_id: user.user_id,
      image_url,
      caption,
      category_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    console.error("Error creating post:", error); 
    res.status(500).json({ message: "Failed to create post", error });
  }
};

export const updateCommentCount = async (req: Request, res: Response) => {
    try {
        const { idPost } = req.params;
        
        // Count comments for this post
        const commentCount = await Comment.count({
            where: { post_id: idPost }
        });

        // Update post
        await Post.update(
            { comments_count: commentCount },
            { where: { post_id: idPost } }
        );

        res.json({ success: true, comments_count: commentCount });
    } catch (error) {
        console.error('Error updating comment count:', error);
        res.status(500).json({ message: 'Failed to update comment count' });
    }
};

export const getPostCommentCount = async (req: Request, res: Response) => {
    try {
        const { idPost } = req.params;
        
        console.log('Fetching comment count for post:', idPost);
        
        const commentCount = await Comment.count({
            where: { 
                post_id: idPost
            }
        });
        
        // Add console.log for debugging
        console.log('Found comment count:', commentCount);
        
        res.json({ 
            success: true,
            count: commentCount 
        });
    } catch (error) {
        console.error('Error getting comment count:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get comment count',
            error
        });
    }
};

