module.exports = {


  friendlyName: 'View modules',


  description: 'Display "Modules" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/modules/list'
    }

  },


  fn: async function (inputs, exits) {

    const zohoModules = await sails.helpers.zoho.modules.get();

    const modules = zohoModules.map(({module_name: name, plural_label: title, api_name: code, ...zModule}) => {
      const module = {title, code};

      if (title !== name) {
        module.title += ` - ${name}`;
      }

      if (code !== name) {
        module.title += ` - [${code}]`;
      }

      return module;
    });

    // Respond with view.
    return exits.success({modules});

  }


};
