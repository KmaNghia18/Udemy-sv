'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lessons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      course_id: {
        type: Sequelize.UUID,           // khớp với courses.id (UUID)
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      video_url: {
        type: Sequelize.TEXT,           // TEXT thay vì STRING (URL dài)
        allowNull: true,
      },
      video_section: {
        type: Sequelize.STRING(255),    // tên chương/section
        allowNull: true,
      },
      video_length: {
        type: Sequelize.INTEGER,        // thời lượng (giây)
        allowNull: true,
      },
      is_free_preview: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Cho phép xem thử miễn phí trước khi mua',
      },
      order_index: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Thứ tự bài học trong course',
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

    await queryInterface.addIndex('lessons', ['course_id']);
    await queryInterface.addIndex('lessons', ['course_id', 'order_index']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lessons');
  },
};
