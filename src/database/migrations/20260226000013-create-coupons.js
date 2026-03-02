'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã coupon (uppercase), VD: REACT50',
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Coupon chỉ áp dụng cho 1 course cụ thể (Layer 1)',
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'userId của instructor tạo coupon',
      },
      discount_type: {
        type: Sequelize.ENUM('percent', 'fixed'),
        allowNull: false,
        defaultValue: 'percent',
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Phần trăm (0-100) hoặc số tiền cố định',
      },
      max_uses: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'null = không giới hạn',
      },
      uses_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      starts_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('coupons', ['code']);
    await queryInterface.addIndex('coupons', ['course_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coupons');
  },
};
