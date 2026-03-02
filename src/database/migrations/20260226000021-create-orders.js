'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Giá gốc tại thời điểm mua',
      },
      discount_amount: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
        comment: 'Số tiền giảm (coupon + promotion)',
      },
      final_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Số tiền thực trả = price - discount_amount',
      },
      coupon_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Mã coupon đã dùng (nếu có)',
      },
      payment_method: {
        type: Sequelize.STRING(30),
        allowNull: true,
        comment: 'stripe, momo, bank_transfer, etc.',
      },
      payment_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID giao dịch từ payment gateway',
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        defaultValue: 'pending',
        allowNull: false,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Thời điểm thanh toán thành công',
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

    // Mỗi user chỉ mua 1 course 1 lần (không mua trùng)
    await queryInterface.addIndex('orders', ['user_id', 'course_id'], {
      unique: true,
      name: 'unique_user_course_order',
    });
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['course_id']);
    await queryInterface.addIndex('orders', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};
