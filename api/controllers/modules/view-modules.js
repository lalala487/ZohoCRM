module.exports = {


  friendlyName: 'View modules',


  description: 'Display "Modules" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/modules/list'
    }

  },


  fn: async function (inputs, exits) {

    const zohoModules = [
      {
        name: 'Contacts',
        title: 'Contacts',
      },
      {
        name: 'Leads',
        title: 'Leads',
      },
      {
        name: 'CustomModule1',
        title: 'Transactions',
      },
    ];

    const modules = zohoModules.map(module => {
      if (module.title !== module.name) {
        module.title += ` - ${module.name}`;
      }

      return module;
    });

    // Respond with view.
    return exits.success({modules});

  }


};
