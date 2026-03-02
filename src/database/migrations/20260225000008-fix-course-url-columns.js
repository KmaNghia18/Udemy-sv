'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Đổi demo_url từ VARCHAR(500) → TEXT
    // để chứa được URL dài (YouTube, Vimeo, v.v.)
    await queryInterface.changeColumn('courses', 'demo_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Đổi thumbnail_url cũng lên TEXT cho nhất quán
    await queryInterface.changeColumn('courses', 'thumbnail_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('courses', 'demo_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.changeColumn('courses', 'thumbnail_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },
};
