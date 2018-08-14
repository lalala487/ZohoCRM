module.exports = {


  friendlyName: 'Execute',


  description: 'Execute query on database-js connection.',


  inputs: {
    connection: {
      example: {},
      required: true,
      type: 'ref',
    },
    query: {
      example: 'INSERT INTO information(id) VALUE(358)',
      required: true,
      type: 'string',
    },
    values: {
      defaultsTo: [],
      example: ['value1', 'value2'],
      type: ['ref'],
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {connection, query, values} = inputs;

    const statement = await connection.prepareStatement(query);

    const result = await statement.execute(...values);

    return exits.success(result);
  }
};

