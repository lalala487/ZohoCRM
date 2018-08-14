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
  const prepared = fields.reduce((carry, field) => {
    // TODO Clean unused data if required
    carry[field[fieldNameIndex]] = field;
    return carry;
  }, {});

  const apiFields = Object.keys(prepared);

  const tableRows = apiFields.reduce((carry, apiField) => {
    if (carry) {
      carry += ',\n ';
    }

    carry += `${apiField} JSON NOT NULL`;

    return carry;
  }, '');

  const table = `${module}_fields`;
  const connection = await sails.helpers.widestage.connection.get(module);

  const createTableSql = `CREATE TABLE ${module} (\n ${tableRows}\n)`;

  await sails.helpers.databaseJs.execute(connection, createTableSql);
  await sails.helpers.db.record.insert(connection, table, prepared);
}
