'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm price_tier_id vào courses
    await queryInterface.addColumn('courses', 'price_tier_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'price_tiers',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      after: 'is_free',   // MySQL: thêm sau cột is_free
    });

    // price vẫn giữ nhưng sẽ auto-sync từ tier
    // estimated_price giờ dùng để hiển thị "giá gốc trước khi giảm" (không bắt buộc)
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('courses', 'price_tier_id');
  },
};
