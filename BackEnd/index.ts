import express, { json, NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { v4 } from "uuid";
import { Category } from "./models/Category";
import { Collection } from "./models/Collection";
import { CollectionPost } from "./models/CollectionPost";
import { Comment } from "./models/Comment";
import { Like } from "./models/Like";
import { Post } from "./models/Post";
import { Session } from "./models/Session";
import { User } from "./models/User";
const config = require("./config/config.json");

const sequelize = new Sequelize({
    models: [Category, Collection, CollectionPost, Like, Post, Session, User, Comment]
});

const app = express();
app.use(json());

app.use((req, res, next) => {
    res.locals.startExecution = Date.now();
    next();
});

// Helper Functions
async function createUser(username: string, email: string, password: string) {
    await sequelize.sync();
    return await User.create({ username, email, password });
}

async function createPost(userId: string, imageUrl: string, caption: string, categoryId: string) {
    await sequelize.sync();
    return await Post.create({
        user_id: userId,
        image_url: imageUrl,
        caption,
        category_id: categoryId
    });
}

async function createComment(userId: string, postId: string, content: string) {
    await sequelize.sync();
    return await Comment.create({
        user_id: userId,
        post_id: postId,
        content
    });
}

async function createCollection(userId: string, collectionName: string) {
    await sequelize.sync();
    return await Collection.create({
        user_id: userId,
        collection_name: collectionName
    });
}

// Auth Routes
app.post("/auth/register", (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    User.findOne({
        where: {
            [Op.or]: [{ username }, { email }]
        }
    })
        .then(async (existingUser: User | null) => {
            if (existingUser) {
                res.status(400).json({ message: 'Username or email already exists' });
                return Promise.reject();
            }

            return await User.create({
                username,
                email,
                password,
            });
        })
        .then((user: User) => {
            res.status(201).json({ message: 'User registered successfully' });
        })
        .catch(() => {
            res.status(500).json({ message: 'Server error' });
        });
});

app.post("/auth/login", (req, res, next) => {
    const { email, password } = req.body;

    interface LoginRequestBody {
        email: string;
        password: string;
    }

    interface LoginResponseBody {
        token?: string;
        message: string;
        error?: string;
    }

    User.findOne({ where: { email } })
        .then((user: User | null) => {
            if (!user || user.password !== (req.body as LoginRequestBody).password) {
                return res.status(401).json({ message: "Invalid credentials" } as LoginResponseBody);
            }

            const token = v4();
            Session.create({ token, user_id: user.user_id })
                .then(() => {
                    res.status(200).json({ token } as LoginResponseBody);
                })
                .catch((err: Error) => {
                    console.error("Error creating session:", err);
                    res.status(500).json({ message: "Internal Server Error", error: err.message } as LoginResponseBody);
                });
        })
        .catch((err: Error) => {
            res.status(401).json({ message: "Invalid credentials" } as LoginResponseBody);
        });
});

// Middleware to check Authorization
app.use((req, res, next): void => {
    if (req.path === "/auth/login" || req.path === "/auth/register") {
        return next();
    }

    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }

    const token = authorizationHeader.split(" ")[1];

    interface SessionWithUser extends Session {
        user: User;
    }

    Session.findOne({
        where: { token },
        include: [User]
    })
        .then((session: SessionWithUser | null) => {
            if (!session) {
                res.status(401).json({ message: "Unauthorized: Invalid token" });
                return;
            }
            (req as any).user = session.user;
            next();
        })
        .catch((err: Error) => {
            res.status(500).json({ message: "Internal Server Error" });
        });
});

// Protected Routes
app.post("/posts", (req: Request, res: Response, next: NextFunction) => {
    const { image_url, caption, category_id } = req.body;
    const user = (req as any).user;

    createPost(user.user_id, image_url, caption, category_id)
        .then(() => {
            res.status(200).json({
                message: "Post created successfully"
            });
            next();
        })
        .catch((err) => {
            next(err);
        });
});

app.get('/posts', (_req: Request, res: Response) => {
    Post.findAll({
        include: [User, Category],
        order: [['createdAt', 'DESC']]
    })
        .then((posts: Post[]) => {
            res.json(posts);
        })
        .catch(() => {
            res.status(500).json({ message: 'Server error' });
        });
});

app.post("/posts/:postId/comments", (req: Request, res: Response, next: NextFunction) => {
    const { content } = req.body;
    const user = (req as any).user;

    createComment(user.user_id, req.params.postId, content)
        .then(() => {
            res.status(200).json({
                message: "Comment created successfully"
            });
            next();
        })
        .catch((err) => {
            next(err);
        });
});

app.post('/posts/:postId/likes', (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    Like.create({
        user_id: user.user_id,
        post_id: req.params.postId
    })
        .then((like: Like) => {
            res.status(201).json(like);
            next();
        })
        .catch(() => {
            res.status(500).json({ message: 'Server error' });
        });
});

app.post('/collections', (req: Request, res: Response, next: NextFunction) => {
    const { collection_name } = req.body;
    const user = (req as any).user;

    createCollection(user.user_id, collection_name)
        .then((collection: Collection) => {
            res.status(201).json(collection);
            next();
        })
        .catch(() => {
            res.status(500).json({ message: 'Server error' });
        });
});

app.post('/collections/:collectionId/posts/:postId', (req: Request, res: Response, next: NextFunction) => {
    CollectionPost.create({
        collection_id: req.params.collectionId,
        post_id: req.params.postId
    })
        .then((collectionPost: CollectionPost) => {
            res.status(201).json(collectionPost);
            next();
        })
        .catch(() => {
            res.status(500).json({ message: 'Server error' });
        });
});

app.get('/categories', (_req: Request, res: Response) => {
    Category.findAll()
        .then((categories: Category[]) => {
            res.json(categories);
        })
        .catch(() => {
            res.status(500).json({ message: 'Server error' });
        });
});

// Logging execution time middleware
app.use((req, res, next) => {
    const endExecution = Date.now();
    console.log(
        "________Execution Time_______",
        endExecution - res.locals.startExecution
    );
    next();
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("__________Error middleware__________", err);
    res.status(500).json({ message: err.message });
});

app.listen(3000, () => {
    console.log("App started at port 3000");
})