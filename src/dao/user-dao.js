const orm = require('../core/orm/db');

class UserDao extends orm.Model {
  constructor() {
    super({
      column: [
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
      ],
      tableName: 't_user'
    });
  }
}

module.exports = new UserDao();
