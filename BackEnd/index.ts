import express from "express";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import categoryRoutes from './routes/categoryRoutes';
import userRoutes from "./routes/userRoutes";

import { authenticate } from "./middlewares/authMiddleware";
import { sequelize, Category } from '../models';

const app = express();

app.use(cors({ 
  origin: 'http://localhost:5173',
  credentials: true 
}));

app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);

// wajib auth
app.use("/posts", authenticate, postRoutes); // create, update, dll
app.use("/users/profile", authenticate);    // hanya user login bisa akses profil sendiri

sequelize.sync().then(async () => {
  const count = await Category.count();
  if (count === 0) {
    await Category.bulkCreate([
      { category_name: "Funny" },
      { category_name: "Animals" },
      { category_name: "Sports" },
    ]);    
    console.log("Dummy categories inserted");
  }

  app.listen(3000, () => {
    console.log("Server running at port 3000");
  });
});
