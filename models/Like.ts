import {
    Table,
    Column,
    DataType,
    Model,
    AllowNull,
    ForeignKey,
    BelongsTo,
  } from "sequelize-typescript";
  
  import { v4 } from "uuid";
  import { User } from "./User";
  import { Post } from "./Post";
  
  @Table({
    tableName: "Like",
    timestamps: true,
    createdAt: "createdAt",
  })
  export class Like extends Model {
    //like_id
    @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: () => v4(),
    })
    declare like_id: string;
  
    //user_id (FK)
    @ForeignKey(() => User)
    @Column({
      type: DataType.UUID,
      field: "user_id",
      allowNull: false,
    })
    declare user_id: string;
  
    @BelongsTo(() => User)
    declare user: User;
  
   
    //post_id (FK)
    @ForeignKey(() => Post)
    @Column({
      type: DataType.UUID,
      field: "post_id",
      allowNull: false,
    })
    declare post_id: string;
    
    @BelongsTo(() => Post)
    declare post: Post;
  
    //createdAt
    @Column({
      type: DataType.DATE,
    })
    declare createdAt: Date;
  
   
  }
  