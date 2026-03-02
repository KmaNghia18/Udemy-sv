'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('instructor_reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,           // Khớp với users.id (UUID)
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      instructor_id: {
        type: Sequelize.UUID,           // Khớp với instructors.id (UUID)
        allowNull: false,
        references: {
          model: 'instructors',         // Bảng đúng là instructors
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Validate chỉ hoạt động ở Model, dùng CHECK constraint cho DB
        comment: 'Rating from 1 to 5',
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // 1 user chỉ được review 1 instructor 1 lần
    await queryInterface.addIndex('instructor_reviews', ['user_id', 'instructor_id'], {
      unique: true,
      name: 'unique_user_instructor_review',
    });

    // Index để query nhanh theo instructor_id và rating
    await queryInterface.addIndex('instructor_reviews', ['instructor_id']);
    await queryInterface.addIndex('instructor_reviews', ['rating']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('instructor_reviews');
  },
};
