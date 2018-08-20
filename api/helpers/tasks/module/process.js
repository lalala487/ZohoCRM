module.exports = {


  friendlyName: 'Process records',


  description: 'Retrieve data from DB by chunks and post them to Zoho',


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

    const dataLayer = await sails.helpers.widestage.layer.get(module);

    await process(dataLayer, sails.config.custom.zoho.chunkSize);

    return exits.success();
  }


};

async function process(dataLayer, limit, page = 1) {
  const prepared = await getRecords(dataLayer, limit, page);
  const {records} = prepared;
  if (records.length) {
    await insertToZoho(dataLayer, prepared);

    await process(dataLayer, limit, ++page);
  }
}

async function saveInsertedData(dataLayer, inserted, uniqueData) {
  const FIELDS = require('../../../enums/DB/FIELDS');

  const uniqueField = getUniqueField(dataLayer);

  const connection = await getDbConnection(dataLayer);

  await sails.helpers.util.asyncForEach(inserted.data, async ({code, details}, index) => {
    if (code === 'SUCCESS') {
      const sql = `UPDATE ${uniqueField.collectionName} SET ${FIELDS.ZOHO_ID} = ? WHERE ${uniqueField.elementName} = ?;`;
      await sails.helpers.databaseJs.execute(connection, sql, [details.id, uniqueData[index]]);
    }
  });
}

async function insertToZoho(dataLayer, {records, uniqueData}) {
  const module = dataLayer.name;
  const inserted = await sails.helpers.zoho.record.insert(records, module);
  // const inserted = {data: [{code: 'SUCCESS', details: {id: + (new Date())}},{code: 'SUCCESS', details: {id: + (new Date()) + 35}}]};//TESTCODE

  if (inserted.hasOwnProperty('data')) {
    await saveInsertedData(dataLayer, inserted, uniqueData);
  }
}

async function getRecords(dataLayer, limit, page = 1) {
  const wideStageData = await sails.helpers.widestage.layer.explore(dataLayer, limit, page);

  return await mapRecords(dataLayer, wideStageData);
}

async function mapRecords(dataLayer, wideStageData) {
  const mapping = await sails.helpers.module.mapping.get(dataLayer);

  const uniqueField = getUniqueField(dataLayer);
  const uniqueFieldIndex = sails.helpers.widestage.field.id.prepare(uniqueField);
  const uniqueData = [];

  const zohoTypes = await getZohoFieldTypes(dataLayer);

  const records = wideStageData.map(row => {
    const record = _.transform(mapping, (carry, target, source) => {
      if (row.hasOwnProperty(source)) {
        carry[target] = prepareZohoData(row[source], zohoTypes[target]);
      }
    });

    uniqueData.push(row[uniqueFieldIndex]);

    return record;
  });

  return {records, uniqueData};
}

async function getZohoFieldTypes(dataLayer) {
  const connection = await getDbConnection(dataLayer);
  const module = dataLayer.name;
  const sql = `SELECT * FROM ${module}_fields`;
  const rows = await sails.helpers.databaseJs.query(connection, sql);

  const params = rows[0];
  const fields = {};

  for (const [field, blobedConfig] of Object.entries(params)) {
    const {api_name, created_source, ...config} = JSON.parse(blobedConfig.toString('utf8'));
    fields[field] = config;
  }

  return fields;
}

function prepareZohoData(value, config) {
  const moment = require('moment');
  let prepared;
  switch (config.data_type) {
    case 'boolean':
      if (typeof value === 'string') {
        prepared = value === 'true';
      } else {
        prepared = !!value;
      }
      break;
    case 'lookup':
    case 'ownerlookup':
      prepared = {id: value};
      break;
    case 'bigint':
    case 'currency':
    case 'double':
    case 'integer':
      prepared = value;//CHECKME do we need convert value here?
      break;
    case 'multiselectpicklist':
      prepared = value.split(',');
      break;
    case 'picklist':// TODO maybe add option validation
      prepared = value;
      break;
    case 'date':
      prepared = moment(value).format('YYYY-MM-DD');
      break;
    case 'datetime':
      prepared = moment(value).format('YYYY-MM-DDTHH:mm:ssZ');
      break;
    default:
      prepared = value;
  }

  return prepared;
}

async function getDbConnection(dataLayer) {
  const dataSource = await sails.helpers.widestage.datasource.get(dataLayer);
  return await sails.helpers.widestage.connection.get(dataSource);
}

function getUniqueField(dataLayer) {
  const WIDESTAGE_LAYER = require('../../../enums/WIDESTAGE/FIELDS');
  const uniqueField = dataLayer.objects.find(field => {
    return field.elementLabel === WIDESTAGE_LAYER.UNIQUE;
  });

  if (uniqueField) {
    return uniqueField;
  } else {
    throw new Error(`Missed ${WIDESTAGE_LAYER.UNIQUE} in data layer ${dataLayer.name}`);
  }
}

