'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột type: text | image
    await queryInterface.addColumn('messages', 'type', {
      type: Sequelize.ENUM('text', 'image'),
      allowNull: false,
      defaultValue: 'text',
      after: 'sender_id',
    });

    // Thêm cột image_url
    await queryInterface.addColumn('messages', 'image_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'type',
    });

    // Cho phép content null (khi gửi ảnh không cần text)
    await queryInterface.changeColumn('messages', 'content', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('messages', 'type');
    await queryInterface.removeColumn('messages', 'image_url');
    await queryInterface.changeColumn('messages', 'content', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
