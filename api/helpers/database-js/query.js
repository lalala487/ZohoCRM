module.exports = {


  friendlyName: 'Query',


  description: 'Query on database-js connection',


  inputs: {
    connection: {
      example: {},
      required: true,
      type: 'ref',
    },
    query: {
      example: 'SELECT * FROM information',
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

    const result = await statement.query(...values);

    return exits.success(result);

  }


};
