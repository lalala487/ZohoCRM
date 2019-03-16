module.exports = {


  friendlyName: 'Explore',


  description: 'Explore layer.',


  inputs: {
    dataLayer: {
      example: {
        name: 'Contacts'
      },
      required: true,
      type: {},
    },
    limit: {
      defaultsTo: 200,
      example: 35,
      type: 'number',
    },
    page: {
      defaultsTo: 1,
      example: 2,
      type: 'number',
    },
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {dataLayer, limit, page} = inputs;

    const _dataSource = await sails.helpers.widestage.datasource.get(dataLayer);

    const collections = prepareCollections(dataLayer);
    sails.log.debug(collections);
    const dataSource = {
      datasourceID: _dataSource.id,
      params: _dataSource.params,
    };

    processJoines(dataLayer, collections);

    const result = await sails.helpers.widestage.collections.process(dataSource, collections, {page, limit});

    // All done.
    return exits.success(result);

  }


};

function prepareCollections(dataLayer) {
  return dataLayer.params.schema.reduce((carry, schema) => {
    const {collectionID} = schema;
    const columns = dataLayer.objects.reduce((carry, field) => {
      if (field.collectionID === collectionID) {
        carry.push(field);
      }

      return carry;
    }, []);

    const collection = {collectionID, columns, schema};
    carry.push(collection);
    return carry;
  }, []);
}


function processJoines(dataLayer, collections) {
  for (let n in dataLayer.params.joins) {
    for (let j in collections) {
      if (dataLayer.params.joins[n].sourceCollectionID === collections[j].collectionID || dataLayer.params.joins[n].targetCollectionID === collections[j].collectionID) {
        {
          let theOther;

          if (dataLayer.params.joins[n].sourceCollectionID === collections[j].collectionID) {
            theOther = dataLayer.params.joins[n].targetCollectionID;
          }

          if (dataLayer.params.joins[n].targetCollectionID === collections[j].collectionID) {
            theOther = dataLayer.params.joins[n].sourceCollectionID;
          }

          if (isTargetInvolved(collections, theOther)) {
            if (!collections[j]['joins']) {
              collections[j]['joins'] = [];
            }

            collections[j]['joins'].push(dataLayer.params.joins[n]);
          }
        }
      }
    }
  }
}

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

