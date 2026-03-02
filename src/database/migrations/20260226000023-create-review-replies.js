'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('review_replies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      review_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'instructor_reviews', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      instructor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'instructors', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      comment: {
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

    // Mỗi instructor chỉ reply 1 lần cho mỗi review
    await queryInterface.addIndex('review_replies', ['review_id', 'instructor_id'], {
      unique: true,
      name: 'unique_instructor_reply_per_review',
    });
    await queryInterface.addIndex('review_replies', ['review_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('review_replies');
  },
};
