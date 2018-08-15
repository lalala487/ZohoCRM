module.exports = {


  friendlyName: 'Get',


  description: 'Get WideStage data source.',


  inputs: {
    layer: {
      example: {},
      required: true,
      type: {},
    }

  },


  exits: {
    layerNotConfigured: {
      description: `There is non configured data source in WideStage layer for selected module. Please configure dataFields properly before fetch`
    },
  },


  fn: async function (inputs, exits) {

    const {layer} = inputs;

    try {
      const dataSourceID = layer.params.schema[0].datasourceID;
      const dataSource = await DataSource.findOne({id: dataSourceID});

      return exits.success(dataSource);
    } catch (e) {
      return exits.layerNotConfigured(module);
    }

  }


};

