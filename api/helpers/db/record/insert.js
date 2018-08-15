module.exports = {


  friendlyName: 'Insert record',


  description: 'Insert record to DB table',


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
      example: {field: 'value', nullable: null},
      type: {},
      required: true,
    },
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    const {connection, record, table} = inputs;
    const keys = Object.keys(record);
    const values = Object.values(record);
    const valuesPlaceholders = values.reduce(carry => {
      if (carry) {
        carry += ', ';
      }

      carry += '?';

      return carry;
    }, '');

    const sql = `INSERT INTO ${table}(\`${keys.join('`,`')}\`) VALUES (${valuesPlaceholders})`;

    const result = await sails.helpers.databaseJs.execute(connection, sql, values);

    // All done.
    return exits.success(result);

  }


};

