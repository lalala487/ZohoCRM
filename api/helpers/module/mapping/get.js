module.exports = {


  friendlyName: 'Get',


  description: 'Get mapping.',


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

