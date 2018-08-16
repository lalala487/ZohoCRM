module.exports = {


  friendlyName: 'Fetch',


  description: 'Fetch fields.',


  inputs: {
    module: {
      example: 'Contacts',
      required: true,
      type: 'string',
    }
  },


  exits: {
    layerNotFound: {
      description: `There is no WideStage layer for selected module. Please create it before fetch`
    }
  },


  fn: async function (inputs, exits) {

    const {module} = inputs;

    const connection = await sails.helpers.module.connection.get(module);

    const fieldsMap = await getApiFields(module);

    const table = await createMappingTable(connection, module, fieldsMap);

    await sails.helpers.db.record.insert(connection, table, fieldsMap);

    return exits.success();
  }
};

async function getApiFields(module) {
  const fields = await sails.helpers.zoho.fields.get(module);
  const fieldNameIndex = 'api_name';

  return fields.reduce((carry, field) => {
    // TODO Clean unused data if required
    carry[field[fieldNameIndex]] = JSON.stringify(field);
    return carry;
  }, {});
}

async function createMappingTable(connection, module, fieldsMap) {
  const apiFields = Object.keys(fieldsMap);
  const tableRows = apiFields.reduce((carry, apiField) => {
    if (carry) {
      carry += ',\n ';
    }

    carry += `${apiField} JSON NOT NULL`;

    return carry;
  }, '');

  const table = `${module}_fields`;

  const createTableSql = `CREATE TABLE ${table} (\n ${tableRows}\n)`;

  await sails.helpers.databaseJs.execute(connection, createTableSql);

  return table;
}

