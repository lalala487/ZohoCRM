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

async function insertToZoho(dataLayer, {records, uniqueData}) {
  // const inserted = await sails.helpers.zoho.record.insert(records);
  const inserted = {data: [{code: 'SUCCESS', details: {id: + (new Date())}},{code: 'SUCCESS', details: {id: + (new Date()) + 35}}]};

  if (inserted.hasOwnProperty('data')) {
    const FIELDS = require('../../../enums/DB/FIELDS');
    const WIDESTAGE_LAYER = require('../../../enums/WIDESTAGE/FIELDS');
    const uniqueField = dataLayer.objects.find(field => {
      return field.elementLabel === WIDESTAGE_LAYER.UNIQUE;
    });

    const dataSource = await sails.helpers.widestage.datasource.get(dataLayer);
    const connection = await sails.helpers.widestage.connection.get(dataSource);
    await sails.helpers.util.asyncForEach(inserted.data, async ({code, details}, index) => {
      if (code === 'SUCCESS') {
        const sql = `UPDATE ${uniqueField.collectionName} SET ${FIELDS.ZOHO_ID} = ? WHERE ${uniqueField.elementName} = ?;`;
        await sails.helpers.databaseJs.execute(connection, sql, [details.id, uniqueData[index]]);
      }
    });
  }
}

async function getRecords(dataLayer, limit, page = 1) {

  const mapping = await sails.helpers.module.mapping.get(dataLayer);

  const wideStageData = await sails.helpers.widestage.layer.explore(dataLayer, limit, page);

  const uniqueField = getUniqueField(dataLayer);
  const uniqueFieldIndex = sails.helpers.widestage.field.id.prepare(uniqueField);
  const uniqueData = [];

  const records = wideStageData.map(row => {
    const record = _.transform(mapping, (carry, target, source) => {
      if (row.hasOwnProperty(source)) {
        carry[target] = row[source];
      }
    });

    uniqueData.push(row[uniqueFieldIndex]);

    return record;
  });

  return {records, uniqueData};
}

function getUniqueField(dataLayer) {
  const WIDESTAGE_LAYER = require('../../../enums/WIDESTAGE/FIELDS');
  return dataLayer.objects.find(field => {
    return field.elementLabel === WIDESTAGE_LAYER.UNIQUE;
  });
}

