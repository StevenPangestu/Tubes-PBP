import express from 'express';
import { controllerWrapper } from '../utils/controllerWrapper';
import { Category } from '../models/Category';

const router = express.Router();

router.get('/', controllerWrapper(async (req, res) => {
  const categories = await Category.findAll({
    order: [['createdAt', 'ASC']],
  });
  return categories;
}));

export default router;
