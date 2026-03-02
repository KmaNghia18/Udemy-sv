'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wishlists', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      // Polymorphic: target có thể là course hoặc lesson
      target_type: {
        type: Sequelize.ENUM('course', 'lesson'),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID của course hoặc lesson',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Mỗi user chỉ thích 1 target 1 lần
    await queryInterface.addIndex('wishlists', ['user_id', 'target_type', 'target_id'], {
      unique: true,
      name: 'unique_user_wishlist_target',
    });
    await queryInterface.addIndex('wishlists', ['user_id']);
    await queryInterface.addIndex('wishlists', ['target_type', 'target_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wishlists');
  },
};
