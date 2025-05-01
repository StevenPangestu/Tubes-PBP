"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const models_1 = require("./models");
const config = require("./config/config.json");
const sequelize = new sequelize_typescript_1.Sequelize(Object.assign(Object.assign({}, config.development), { models: [models_1.Category, models_1.Collection, models_1.CollectionPost, models_1.Comment, models_1.Like, models_1.Post, models_1.Session, models_1.User] }));
const app = (0, express_1.default)();
app.use((0, express_1.json)());
// Logging middleware
app.use((req, res, next) => {
    console.log("Request received at", new Date(), req.path, req.params, req.body);
    next();
});
app.use((req, res, next) => {
    res.locals.startExecution = Date.now();
    next();
});
// Helper Functions
function createUser(username, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.sync();
        return yield models_1.User.create({ username, email, password });
    });
}
function createPost(userId, imageUrl, caption, categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.sync();
        return yield models_1.Post.create({
            user_id: userId,
            image_url: imageUrl,
            caption,
            category_id: categoryId
        });
    });
}
function createComment(userId, postId, content) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.sync();
        return yield models_1.Comment.create({
            user_id: userId,
            post_id: postId,
            content
        });
    });
}
function createCollection(userId, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.sync();
        return yield models_1.Collection.create({
            user_id: userId,
            collection_name: collectionName
        });
    });
}
// Auth Routes
app.post("/auth/register", (req, res) => {
    const { username, email, password } = req.body;
    models_1.User.findOne({
        where: {
            [sequelize_1.Op.or]: [{ username }, { email }]
        }
    })
        .then((existingUser) => {
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        return models_1.User.create({
            username,
            email,
            password, // In production, hash the password before saving
        });
    })
        .then((user) => {
        res.status(201).json({ message: 'User registered successfully' });
    })
        .catch(() => {
        res.status(500).json({ message: 'Server error' });
    });
});
app.post("/auth/login", (req, res, next) => {
    const { email, password } = req.body;
    models_1.User.findOne({ where: { email } })
        .then((user) => {
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = (0, uuid_1.v4)();
        models_1.Session.create({ token, user_id: user.user_id })
            .then(() => {
            res.status(200).json({ token });
        })
            .catch((err) => {
            console.error("Error creating session:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        });
    })
        .catch((err) => {
        res.status(401).json({ message: "Invalid credentials" });
    });
});
// Middleware to check Authorization
app.use((req, res, next) => {
    if (req.path === "/auth/login" || req.path === "/auth/register") {
        return next();
    }
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    const token = authorizationHeader.split(" ")[1];
    models_1.Session.findOne({
        where: { token },
        include: [models_1.User]
    })
        .then((session) => {
        if (!session) {
            res.status(401).json({ message: "Unauthorized: Invalid token" });
            return;
        }
        req.user = session.user;
        next();
    })
        .catch((err) => {
        res.status(500).json({ message: "Internal Server Error" });
    });
});
// Protected Routes
app.post("/posts", (req, res, next) => {
    const { image_url, caption, category_id } = req.body;
    const user = req.user;
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
app.get('/posts', (_req, res) => {
    models_1.Post.findAll({
        include: [models_1.User, models_1.Category],
        order: [['createdAt', 'DESC']]
    })
        .then((posts) => {
        res.json(posts);
    })
        .catch(() => {
        res.status(500).json({ message: 'Server error' });
    });
});
app.post("/posts/:postId/comments", (req, res, next) => {
    const { content } = req.body;
    const user = req.user;
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
app.post('/posts/:postId/likes', (req, res, next) => {
    const user = req.user;
    models_1.Like.create({
        user_id: user.user_id,
        post_id: req.params.postId
    })
        .then((like) => {
        res.status(201).json(like);
        next();
    })
        .catch(() => {
        res.status(500).json({ message: 'Server error' });
    });
});
app.post('/collections', (req, res, next) => {
    const { collection_name } = req.body;
    const user = req.user;
    createCollection(user.user_id, collection_name)
        .then((collection) => {
        res.status(201).json(collection);
        next();
    })
        .catch(() => {
        res.status(500).json({ message: 'Server error' });
    });
});
app.post('/collections/:collectionId/posts/:postId', (req, res, next) => {
    models_1.CollectionPost.create({
        collection_id: req.params.collectionId,
        post_id: req.params.postId
    })
        .then((collectionPost) => {
        res.status(201).json(collectionPost);
        next();
    })
        .catch(() => {
        res.status(500).json({ message: 'Server error' });
    });
});
app.get('/categories', (_req, res) => {
    models_1.Category.findAll()
        .then((categories) => {
        res.json(categories);
    })
        .catch(() => {
        res.status(500).json({ message: 'Server error' });
    });
});
// Logging execution time middleware
app.use((req, res, next) => {
    const endExecution = Date.now();
    console.log("________Execution Time_______", endExecution - res.locals.startExecution);
    next();
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.log("__________Error middleware__________", err);
    res.status(500).json({ message: err.message });
});
// Request finished log
app.use((req, res, next) => {
    console.log("Request Finished");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App started at port ${PORT}`);
});
