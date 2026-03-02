'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false,
      },
      instructor_id: {
        type: Sequelize.UUID,              // Khớp với instructors.id (UUID)
        allowNull: true,
        references: {
          model: 'instructors',            // Bảng đúng là instructors
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      categories: {
        type: Sequelize.TEXT,              // TEXT thay STRING → lưu nhiều category (JSON/csv)
        allowNull: true,
      },
      tags: {
        type: Sequelize.TEXT,              // TEXT thay STRING → lưu nhiều tag
        allowNull: true,
      },
      level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      estimated_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      is_free: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      thumbnail_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      demo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      average_rating: {                    // Đổi từ 'ratings' → 'average_rating' cho nhất quán
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      total_reviews: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      purchased: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of times purchased',
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending', 'active', 'rejected', 'locked'),
        defaultValue: 'draft',
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

    await queryInterface.addIndex('courses', ['instructor_id']);
    await queryInterface.addIndex('courses', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('courses');
  },
};
