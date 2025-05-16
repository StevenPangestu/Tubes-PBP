import { Sequelize } from 'sequelize-typescript';
import { User } from './User';
import { Session } from './Session';
import { Post } from './Post';
import { Comment } from './Comment';
import { Like } from './Like';
import { Collection } from './Collection';
import { CollectionPost } from './CollectionPost';
import { Category } from './Category';
// import { Follow } from './Follow';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '127.0.0.1',
  username: 'postgres',
  password: '0810',
  database: 'tubespbp',
  models: [User, Session, Post, Comment, Like, Collection, CollectionPost, Category],
});

export {
  User,
  Session,
  Post,
  Comment,
  Like,
  Collection,
  CollectionPost,
  Category,
  // Follow
};