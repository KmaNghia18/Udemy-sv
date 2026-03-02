'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_discussions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      lesson_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'lessons', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      // parent_id NULL = comment gốc, có giá trị = reply (dạng cây)
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null,
        references: { model: 'lesson_discussions', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('lesson_discussions', ['lesson_id']);
    await queryInterface.addIndex('lesson_discussions', ['user_id']);
    await queryInterface.addIndex('lesson_discussions', ['parent_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lesson_discussions');
  },
};
