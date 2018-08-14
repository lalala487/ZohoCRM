module.exports = {


  friendlyName: 'Get fields',


  description: '',


  inputs: {
    modules: {
      example: ['Contacts', 'Leads'],
      required: true,
      type: ['ref'],
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {modules} = inputs;

    await sails.helpers.util.asyncForEach(modules, async module => {
      await fetchModuleData(module);
    });

    return exits.success();

  }


};

async function fetchModuleData(module) {
  const fields = await sails.helpers.zoho.fields.get(module);
  const fieldNameIndex = 'api_name';// TODO setup correct API v2 field name
  const tableRows = fields.reduce((carry, field) => {
    if (carry) {
      carry += ', \n';
    }

    carry += `${field[fieldNameIndex]} JSON NOT NULL`;

    return carry;
  }, '');

  const createTableSql = `CREATE TABLE ${module}_fields ( ${tableRows} )`;
}
