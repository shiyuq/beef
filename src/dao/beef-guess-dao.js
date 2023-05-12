const orm = require('../core/orm/db');

class BeefGuessDao extends orm.Model {
  constructor() {
    super({
      column: [
        'id',
        'location',
        'price',
        'date',
        'created_time',
        'last_update_time'
      ],
      tableName: 't_beef_guess'
    });
  }

  async findData({ provinceList = [], startDate = '', endDate = '' }) {
    const sql = this.knex()
      .select(...this.column)
      .from({ beef: 't_beef_guess' })
      .orderBy([{ column: 'beef.date', order: 'asc' }]);
    if (provinceList.length) {
      sql.whereIn('beef.location', provinceList);
    }
    if (startDate) {
      sql.where('date', '>=', startDate);
    }
    if (endDate) {
      sql.where('date', '<', endDate);
    }
    return sql.exec();
  }
}

module.exports = new BeefGuessDao();
