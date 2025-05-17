import express from 'express';
import { Category } from '../models/Category';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['createdAt', 'ASC']],
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error });
  }
});

export default router;
