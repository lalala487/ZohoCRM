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
        db: 'some_db',
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
      const {userName, password, host, port, db} = params;
      const connection = new Database(`database-js-mysql://${userName}:${password}@${host}:${port}/${db}`);
      return exits.success(connection);
    } catch (e) {
      return exits.cantEstablishConnection(e, params);
    }

  }

};

