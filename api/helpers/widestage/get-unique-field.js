const WIDESTAGE_LAYER = require('../../enums/WIDESTAGE/FIELDS');

module.exports = {


  friendlyName: 'Get unique field',


  description: '',


  sync: true,


  inputs: {
    dataLayer: {
      example: {},
      required: true,
      type: {},
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Unique field',
      outputType: 'ref'
    },

    misconfiguration: {
      description: `Missed ${WIDESTAGE_LAYER.UNIQUE} in data layer`
    }

  },


  fn: function (inputs, exits) {
    const {dataLayer} = inputs;
    const uniqueField = dataLayer.objects.find(field => {
      return field.elementLabel === WIDESTAGE_LAYER.UNIQUE;
    });

    if (uniqueField) {
      return exits.success(uniqueField);
    } else {
      return exits.misconfiguration(dataLayer.name);
    }


  }


};

