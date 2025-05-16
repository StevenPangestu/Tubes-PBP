"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Category", {
      category_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Category");
  },
};
