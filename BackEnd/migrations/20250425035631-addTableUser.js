  'use strict';

  /** @type {import('sequelize-cli').Migration} */
  module.exports = {
    async up (queryInterface, Sequelize) {
      await queryInterface.createTable("User", {
        user_id :{
          type: Sequelize.UUID,
          primaryKey:true,
          allowNull:false
        },
        username :{
          type : Sequelize.STRING,
          allowNull : false,
        },
        email :{
          type:Sequelize.STRING,
          allowNull:false
        },
        password : {
          type:Sequelize.DATE,
          allowNull:false,
        },
        profile_picture:{
          type: Sequelize.STRING,
          allowNull:true,
        }, 
        bio:{
          type: Sequelize.STRING,
          allowNull:true,
        },
        createdAt:{
          type: Sequelize.DATE,
          allowNull:false,
          defaultValue : Sequelize.NOW,
        },
        updatedAt:{
          type: Sequelize.DATE,
          allowNull:false,
          defaultValue : Sequelize.NOW,
        }
      })
    },

    async down (queryInterface, Sequelize) {
      
      await queryInterface.dropTable('User');
    }
  };
