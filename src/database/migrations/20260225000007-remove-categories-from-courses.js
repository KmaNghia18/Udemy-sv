'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Xóa cột categories TEXT (đã chuyển sang bảng riêng)
    await queryInterface.removeColumn('courses', 'categories');
  },

  async down(queryInterface, Sequelize) {
    // Rollback: thêm lại cột nếu undo
    await queryInterface.addColumn('courses', 'categories', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
