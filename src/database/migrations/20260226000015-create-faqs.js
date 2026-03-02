'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('faqs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      question: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nhóm câu hỏi, VD: "Thanh toán", "Học tập", "Tài khoản"',
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

    // Seed một số FAQ mẫu
    await queryInterface.bulkInsert('faqs', [
      { question: 'Làm thế nào để đăng ký tài khoản?', answer: 'Bạn nhấn vào nút "Đăng ký" ở góc trên bên phải, điền thông tin và xác nhận email.', category: 'Tài khoản', is_active: true },
      { question: 'Tôi có thể học trên thiết bị nào?', answer: 'Bạn có thể học trên máy tính, điện thoại và máy tính bảng qua trình duyệt web hoặc ứng dụng di động.', category: 'Học tập', is_active: true },
      { question: 'Làm thế nào để thanh toán khóa học?', answer: 'Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, ví điện tử và chuyển khoản ngân hàng.', category: 'Thanh toán', is_active: true },
      { question: 'Tôi có được hoàn tiền không?', answer: 'Bạn có thể yêu cầu hoàn tiền trong vòng 30 ngày kể từ ngày mua nếu chưa học quá 20% khóa học.', category: 'Thanh toán', is_active: true },
      { question: 'Khóa học có hết hạn không?', answer: 'Không, bạn được truy cập vĩnh viễn sau khi mua khóa học, kể cả các cập nhật trong tương lai.', category: 'Học tập', is_active: true },
      { question: 'Làm thế nào để trở thành instructor?', answer: 'Đăng nhập vào tài khoản, vào mục "Trở thành Instructor" và điền thông tin hồ sơ. Admin sẽ duyệt trong vòng 24-48 giờ.', category: 'Tài khoản', is_active: true },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('faqs');
  },
};
