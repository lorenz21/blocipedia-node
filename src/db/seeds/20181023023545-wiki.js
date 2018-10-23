'use strict';

const faker = require('faker');

let wikis = [];

for(let i = 0; i <= 15; i++) {
  wikis.push({
    title: faker.hacker.verb(),
    body: faker.hacker.phrase(),
    userId: i,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.bulkInsert("Wikis", wikis, {});

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Wikis", null, {});
  }
};
