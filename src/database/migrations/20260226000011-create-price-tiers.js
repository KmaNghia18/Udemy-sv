'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('price_tiers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Tier label, e.g. "Free", "Tier 1", "Tier 2"',
      },
      price: {
        type: Sequelize.DECIMAL(12, 0),
        allowNull: false,
        defaultValue: 0,
        comment: 'Price in VND',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    // Seed default tiers (giống Udemy nhưng dùng VND)
    await queryInterface.bulkInsert('price_tiers', [
      { label: 'Free',    price: 0,        is_active: true, sort_order: 0 },
      { label: 'Tier 1',  price: 99000,    is_active: true, sort_order: 1 },
      { label: 'Tier 2',  price: 199000,   is_active: true, sort_order: 2 },
      { label: 'Tier 3',  price: 299000,   is_active: true, sort_order: 3 },
      { label: 'Tier 4',  price: 399000,   is_active: true, sort_order: 4 },
      { label: 'Tier 5',  price: 499000,   is_active: true, sort_order: 5 },
      { label: 'Tier 6',  price: 699000,   is_active: true, sort_order: 6 },
      { label: 'Tier 7',  price: 999000,   is_active: true, sort_order: 7 },
      { label: 'Tier 8',  price: 1299000,  is_active: true, sort_order: 8 },
      { label: 'Tier 9',  price: 1499000,  is_active: true, sort_order: 9 },
      { label: 'Tier 10', price: 1999000,  is_active: true, sort_order: 10 },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('price_tiers');
  },
};
