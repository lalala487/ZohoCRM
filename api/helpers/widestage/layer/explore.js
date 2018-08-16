module.exports = {


  friendlyName: 'Explore',


  description: 'Explore layer.',


  inputs: {
    name: {
      example: 'Contacts',
      required: true,
      type: 'string',
    },
    limit: {
      defaultsTo: 200,
      example: 35,
      type: 'number',
    },
    skip: {
      defaultsTo: 0,
      example: 2,
      type: 'number',
    },
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {name, limit, skip} = inputs;

    const dataLayer = await sails.helpers.widestage.layer.get(name);
    const _dataSource = await sails.helpers.widestage.datasource.get(dataLayer);

    const collections = dataLayer.params.schema.reduce((carry, schema) => {
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

    const dataSource = {
      datasourceID: _dataSource.id,
      params: _dataSource.params,
    };

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

    const result = await sails.helpers.widestage.collections.process(dataSource, collections);

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

