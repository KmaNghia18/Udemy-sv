'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Thêm cột review_type để phân biệt instructor review và course review
    await queryInterface.addColumn('review_replies', 'review_type', {
      type: Sequelize.ENUM('instructor', 'course'),
      allowNull: false,
      defaultValue: 'instructor',
      after: 'id',
    });

    // 2. Xóa FK constraint cũ (review_id chỉ trỏ instructor_reviews)
    await queryInterface.removeConstraint('review_replies', 'review_replies_ibfk_1');

    // 3. Xóa unique index cũ
    await queryInterface.removeIndex('review_replies', 'unique_instructor_reply_per_review');

    // 4. Tạo unique index mới (review_type + review_id + instructor_id)
    await queryInterface.addIndex('review_replies', ['review_type', 'review_id', 'instructor_id'], {
      unique: true,
      name: 'unique_reply_per_review',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('review_replies', 'unique_reply_per_review');

    await queryInterface.addIndex('review_replies', ['review_id', 'instructor_id'], {
      unique: true,
      name: 'unique_instructor_reply_per_review',
    });

    // Thêm lại FK
    await queryInterface.addConstraint('review_replies', {
      fields: ['review_id'],
      type: 'foreign key',
      name: 'review_replies_ibfk_1',
      references: { table: 'instructor_reviews', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.removeColumn('review_replies', 'review_type');
  },
};
