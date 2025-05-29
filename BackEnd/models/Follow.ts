import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from "sequelize-typescript";
import { v4 } from "uuid";
import { User } from "./User";

@Table({
  tableName: 'Follow',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
})
export class Follow extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: () => v4(),
  })
  declare follow_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare follower_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare following_id: string;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @BelongsTo(() => User, 'follower_id')
  declare follower: User;

  @BelongsTo(() => User, 'following_id')
  declare following: User;
}
