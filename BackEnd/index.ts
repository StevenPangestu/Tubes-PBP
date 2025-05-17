import cors from "cors";
import express from "express";
import path from "path";

import authRoutes from "./routes/authRoutes";
import categoryRoutes from './routes/categoryRoutes';
import collectionRoutes from "./routes/collectionRoutes";
import commentRoutes from "./routes/commentRoute";
import postRoutes from "./routes/postRoutes";
import userRoutes from "./routes/userRoutes";

import { authenticate } from "./middlewares/authMiddleware";
import { Category, sequelize } from './models';

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
app.use("/collections", authenticate, collectionRoutes)
app.use("/", authenticate, commentRoutes); // create, update, dll

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
