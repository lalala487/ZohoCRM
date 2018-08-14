module.exports = {


  friendlyName: 'Update record',


  description: '',


  inputs: {
    connection: {
      example: {},
      required: true,
      type: 'ref',
    },
    table: {
      example: 'some_db_table',
      type: 'string',
      required: true,
    },
    record: {
      example: {firstKey: 'value', secondKey: null},
      type: {},
      required: true,
    },
    condition: {
      example: 'id = ?',
      type: 'string',
      required: true,
    },
    conditionValues: {
      defaultsTo: [],
      example: [358],
      type: ['ref'],
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    const {connection, record, table, condition, conditionValues} = inputs;
    const keys = Object.keys(record);
    const values = Object.values(record).concat(conditionValues);

    const toUpdate = keys.reduce((carry, key) => {
      if (carry) {
        carry += ', ';
      }

      carry += `${key} = ?`;

      return carry;
    }, '');

    const sql = `UPDATE ${table} SET ${toUpdate} WHERE ${condition}`;

    await sails.helpers.databaseJs.execute(connection, sql, values);
    // All done.
    return exits.success();

  }


};

