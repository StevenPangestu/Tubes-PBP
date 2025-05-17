// 'use strict';

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('Follow', {
//       follow_id: {
//         type: Sequelize.UUID,
//         primaryKey: true,
//         allowNull: false,
//         defaultValue: Sequelize.UUIDV4
//       },
//       follower_id: {
//         type: Sequelize.UUID,
//         allowNull: false,
//         references: {
//           model: 'User',
//           key: 'user_id'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE'
//       },
//       following_id: {
//         type: Sequelize.UUID,
//         allowNull: false,
//         references: {
//           model: 'User',
//           key: 'user_id'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE'
//       },
//       createdAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.NOW
//       }
//     });

//     await queryInterface.addConstraint('Follow', {
//       fields: ['follower_id', 'following_id'],
//       type: 'unique',
//       name: 'unique_follow_pair'
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable('Follow');
//   }
// };