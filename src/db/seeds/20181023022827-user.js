'use strict';

const faker = require('faker');
const bcrypt = require('bcryptjs');

let users = [];

for(let i = 0; i <= 5; i++) {
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync('steve0', salt);
  users.push({
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: hashedPassword,
    role: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};