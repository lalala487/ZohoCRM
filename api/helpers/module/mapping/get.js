module.exports = {


  friendlyName: 'Get',


  description: 'Get mapping.',


  inputs: {
    dataLayer: {
      example: {
        name: 'Contacts'
      },
      required: true,
      type: {},
    }
  },


  exits: {
  },


  fn: async function (inputs, exits) {

    const {dataLayer} = inputs;
    const module = dataLayer.name;

    const mappingLayer = await sails.helpers.widestage.layer.get(`${module}_mapping`);

    const mapping = mappingLayer.params.joins.reduce((carry, join) => {
      for (let field of dataLayer.objects) {
        if (join.sourceElementName === field.elementName && join.sourceCollectionName === field.collectionName) {
          carry[sails.helpers.widestage.field.id.prepare(field)] = join.targetElementName;
          break;
        }
      }

      return carry;
    }, {});
    // All done.
    return exits.success(mapping);

  }


};

