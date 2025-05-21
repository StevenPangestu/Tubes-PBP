import { Sequelize } from 'sequelize-typescript';
import { Category } from './Category';
import { Collection } from './Collection';
import { CollectionPost } from './CollectionPost';
import { Comment } from './Comment';
import { Like } from './Like';
import { Post } from './Post';
import { Session } from './Session';
import { User } from './User';
// import { Follow } from './Follow';


export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '127.0.0.1',
  username: 'postgres',
  password: 'rja021005',
  database: 'tubespbp',
  models: [User, Session, Post, Comment, Like, Collection, CollectionPost, Category],
});

export {
  Category, Collection,
  CollectionPost, Comment,
  Like, Post, Session, User
};

