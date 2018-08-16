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

    const records = await process(module, sails.config.custom.zoho.chunkSize);

    return exits.success(records);
  }


};

async function process(module, limit, page = 1) {
  const records = await getRecords(module, limit, page);
  if (records) {
    await getRecords(module, limit, ++page);
  }
}

async function getRecords(module, limit, page = 1) {

  const mapping = await sails.helpers.module.mapping.get(module);

  const wideStageData = await sails.helpers.widestage.layer.explore(module, limit, page);

  const records = wideStageData.map(row => {
    return _.transform(mapping, (carry, target, source) => {
      if (row.hasOwnProperty(source)) {
        carry[target] = row[source];
      }
    });
  });

  return records;
}

