module.exports = {


  friendlyName: 'Async foreach',


  description: '',


  inputs: {
    array: {
      example: [1, 2, 3],
      required: true,
      type: ['ref'],
    },
    callback: {
      example: async (value, index, array) => { console.log(arguments); },
      required: true,
      type: 'ref',
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    const {array, callback} = inputs;

    for (let index = 0; index < array.length; index++) {
      // eslint-disable-next-line callback-return
      await callback(array[index], index, array);
    }

    return exits.success();

  }


};

