// import {
//     Table,
//     Column,
//     DataType,
//     Model,
//     ForeignKey,
//   } from "sequelize-typescript";
  
//   import { v4 } from "uuid";
//   import { User } from "./User";

// @Table({
//   tableName: 'Follow',
//   timestamps: true,
//   createdAt: 'createdAt',
//   updatedAt: false
// })
// export class Follow extends Model {
//   @Column({
//     primaryKey: true,
//     type: DataType.UUID,
//     defaultValue: () => v4(),
//   })
//   declare follow_id: string;

//   @ForeignKey(() => User)
//   @Column({
//     type: DataType.UUID,
//     allowNull: false,
//   })
//   declare follower_id: string;

//   @ForeignKey(() => User)
//   @Column({
//     type: DataType.UUID,
//     allowNull: false,
//   })
//   declare following_id: string;
// }