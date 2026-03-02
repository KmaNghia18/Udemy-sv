'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promotions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Tên đợt khuyến mãi, VD: "Black Friday 2026"',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      discount_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Admin chỉ dùng %; ghi đè giá tier (Layer 2)',
      },
      scope: {
        type: Sequelize.ENUM('all', 'specific_tiers', 'specific_categories'),
        defaultValue: 'all',
        allowNull: false,
        comment: '"all" = toàn sàn; có thể mở rộng sau',
      },
      // JSON array of tier IDs or category IDs (dùng khi scope != all)
      scope_ids: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array: [1,2,3] tier IDs hoặc category UUIDs',
      },
      min_price_tier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Chỉ áp dụng cho course có priceTier >= min_price_tier_id',
        references: { model: 'price_tiers', key: 'id' },
        onDelete: 'SET NULL',
      },
      starts_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ends_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex('promotions', ['is_active', 'starts_at', 'ends_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('promotions');
  },
};
