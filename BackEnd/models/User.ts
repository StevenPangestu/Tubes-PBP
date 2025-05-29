import {
  Table,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Default,
  HasMany,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Follow } from './Follow';
import { Post } from './Post';

@Table({
  tableName: "User",
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column(DataType.STRING)
  declare profile_picture: string | null;

  @Column(DataType.STRING)
  declare bio: string | null;

  @HasMany(() => Post)
  declare posts: Post[];

  @HasMany(() => Follow, 'follower_id')
  declare following: Follow[];
  
  @HasMany(() => Follow, 'following_id')
  declare followers: Follow[];
}
