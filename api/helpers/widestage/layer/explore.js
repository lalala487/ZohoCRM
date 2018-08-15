module.exports = {


  friendlyName: 'Explore',


  description: 'Explore layer.',


  inputs: {
    name: {
      example: 'Contacts',
      required: true,
      type: 'string',
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {name} = inputs;

    const dataLayer = await sails.helpers.widestage.layer.get(name);
    const dataSource = await sails.helpers.widestage.datasource.get(dataLayer);

    for (let schema of dataLayer.params.schema) {
      for (let j in dataSource.collections) {
        if (schema.collectionID === dataSource.collections[j].collectionID) {
          dataSource.collections[j]['schema'] = schema;
        }
      }
    }

    for (let n in dataLayer.params.joins) {
      for (let j in dataSource.collections) {
        if (dataLayer.params.joins[n].sourceCollectionID === dataSource.collections[j].collectionID || dataLayer.params.joins[n].targetCollectionID === dataSource.collections[j].collectionID) {
          {
            let theOther;

            if (dataLayer.params.joins[n].sourceCollectionID === dataSource.collections[j].collectionID) {
              theOther = dataLayer.params.joins[n].targetCollectionID;
            }

            if (dataLayer.params.joins[n].targetCollectionID === dataSource.collections[j].collectionID) {
              theOther = dataLayer.params.joins[n].sourceCollectionID;
            }

            if (isTargetInvolved(dataSource.collections, theOther)) {
              if (!dataSource.collections[j]['joins']) {
                dataSource.collections[j]['joins'] = [];
              }

              dataSource.collections[j]['joins'].push(dataLayer.params.joins[n]);
            }
          }
        }
      }
    }

    const result = await sails.helpers.widestage.collections.process(dataSource, [dataLayer]);

    // All done.
    return exits.success(result);

  }


};

function isTargetInvolved(collections, theOtherID) {
  let found = false;

  for (let collection of collections) {
    if (collection.collectionID === theOtherID) {
      found = true;
      break;
    }
  }

  return found;

}

