'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certificates', {
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
      // Mã chứng chỉ duy nhất — dùng để xác minh
      certificate_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      // Snapshot tại thời điểm cấp
      user_name_at_issue: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Snapshot of user name at certificate issue time',
      },
      course_name_at_issue: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Snapshot of course name at certificate issue time',
      },
      mentor_name_at_issue: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Snapshot of mentor/instructor name at certificate issue time',
      },
      issue_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    // Mỗi user chỉ có 1 certificate cho mỗi course
    await queryInterface.addIndex('certificates', ['user_id', 'course_id'], {
      unique: true,
      name: 'unique_user_course_certificate',
    });
    await queryInterface.addIndex('certificates', ['course_id']);
    await queryInterface.addIndex('certificates', ['certificate_code'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('certificates');
  },
};
