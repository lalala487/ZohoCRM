const connections = {};

module.exports = {


  friendlyName: 'Get connection',


  description: '',


  inputs: {
    params: {
      example: {
        userName: '',
        password: 'root',
        host: '127.0.0.1',
        port: '3306',
        database: 'some_db',
      },
      required: true,
      type: {},
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Connection',
      outputType: 'ref'
    },
    cantEstablishConnection: {
      description: `Can't establish connection to DB`
    }

  },


  fn: async function (inputs, exits) {

    const {params} = inputs;
    try {
      const Database = require('database-js').Connection;
      const {userName, password, host, port, database} = params;
      const connectionString = `database-js-mysql://${userName}:${password}@${host}:${port}/${database}`;

      if (typeof connections[connectionString] === 'undefined') {
        connections[connectionString] = new Database(connectionString);
      }

      return exits.success(connections[connectionString]);
    } catch (e) {
      return exits.cantEstablishConnection(e, params);
    }

  }

};

