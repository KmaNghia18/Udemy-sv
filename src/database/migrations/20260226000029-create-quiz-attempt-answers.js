'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quiz_attempt_answers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      attempt_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quiz_attempts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quiz_questions', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      selected_answer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quiz_answers', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });

    await queryInterface.addIndex('quiz_attempt_answers', ['attempt_id']);
    await queryInterface.addIndex('quiz_attempt_answers', ['attempt_id', 'question_id'], {
      unique: true,
      name: 'unique_attempt_question',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('quiz_attempt_answers');
  },
};
