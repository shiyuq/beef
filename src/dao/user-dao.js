const Model = require('../core/orm/knex/model');

const tableName = 't_user';

const tableField = [
  'id',
  'avatar',
  'contact_number',
  'password',
  'salt',
  'nickname',
  'name',
  'identity_card',
  'address',
  'address_detail',
  'created_time',
  'created_user',
  'last_update_time',
  'last_update_user'
];

class UserDao extends Model {
  constructor() {
    super({
      column: tableField,
      tableName
    });
  }
}

module.exports = new UserDao();
