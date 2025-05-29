'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Follow", {
      follow_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      follower_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      following_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Follow");
  }
};
