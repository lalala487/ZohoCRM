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
  },


  fn: async function (inputs, exits) {

    const {module} = inputs;

    const layer = await sails.helpers.widestage.layer.get(module);

    const connection = await sails.helpers.widestage.connection.getByLayer(layer);

    await addZohoIdField(connection, layer);

    const fieldsMap = await getApiFields(module);

    const table = await createMappingTable(connection, module, fieldsMap);

    await sails.helpers.db.record.insert(connection, table, fieldsMap);

    return exits.success();
  }
};

async function getApiFields(module) {
  const fields = await sails.helpers.zoho.fields.get(module);
  const fieldNameIndex = 'api_name';

  const indexesToClean = ['auto_number', 'businesscard_supported', 'id', 'read_only', 'view_type', 'visible', 'webhook'];
  const groupByTypes = {};

  const apiFields = fields.reduce((carry, field) => {
    // TODO Clean unused data if required
    const {read_only: readOnly} = field;

    indexesToClean.forEach(index => {
      delete field[index];
    });

    if (!readOnly) {
      if (!groupByTypes.hasOwnProperty(field.data_type)) {
        groupByTypes[field.data_type] = [];
      }
      groupByTypes[field.data_type].push(field);
      carry[field[fieldNameIndex]] = JSON.stringify(field);
    } else {
      console.log(field);
    }

    return carry;
  }, {});

  return apiFields;
}

async function createMappingTable(connection, module, fieldsMap) {
  const apiFields = Object.keys(fieldsMap);
  const tableRows = apiFields.reduce((carry, apiField) => {
    if (carry) {
      carry += ',\n ';
    }

    carry += `\`${apiField}\` BLOB NOT NULL`;

    return carry;
  }, '');

  const table = `${module}_fields`;

  const createTableSql = `CREATE TABLE ${table} (\n ${tableRows}\n) ROW_FORMAT=DYNAMIC`;

  await sails.helpers.databaseJs.execute(connection, createTableSql);

  return table;
}

async function addZohoIdField(connection, dataLayer) {
  try {
    const FIELDS = require('../../../enums/DB/FIELDS');
    const uniqueField = sails.helpers.widestage.getUniqueField(dataLayer);

    const sql = `ALTER TABLE ${uniqueField.collectionName} ADD ${FIELDS.ZOHO_ID} VARCHAR(31) NULL;`;

    try {
      await sails.helpers.databaseJs.execute(connection, sql);
    } catch (e) {
      console.error(e);
    }
  } catch (e) {//missed unique field
    console.log(e);
  }
}

