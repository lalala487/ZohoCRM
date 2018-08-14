module.exports = {


  friendlyName: 'Assign zoho ids',


  description: '',


  inputs: {
    connection: {
      example: {},
      required: true,
      type: 'ref',
    },
    inserted: {
      description: 'Zoho response which contains inserted records data',
      example: {data: [{code: 'SUCCESS', details: {id: '213112312'}}]},
      required: true,
      type: {},
    },
    records: {
      example: [{RECORD_ID: 1246}],
      required: true,
      type: ['ref'],
    },
    zohoBinding: {
      example: {
        conditionField: 'RECORD_ID',
        table: 'Contacts',
      },
      required: true,
      type: {},
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {inserted} = inputs;


    if (inserted.hasOwnProperty('data')) {
      const FIELDS = require('../../enums/DB/FIELDS');
      const {connection, records, zohoBinding: {table, conditionField}} = inputs;
      /*
      const sql = inserted.data.reduce((carry, {code, details}, index) => {
        if (code === 'SUCCESS') {
          carry += `UPDATE ${TABLES.PRODUCTS} SET ${FIELDS.ZOHO_ID} = '${details.id}' WHERE ${FIELDS.PRODUCT_ID} = ${records[index][FIELDS.PRODUCT_ID]};`;
        }
        return carry;
      }, '');

      await sails.helpers.adodb.execute(sql, DBS.PRODUCTS);
      */
      await sails.helpers.util.asyncForEach(inserted.data, async ({code, details}, index) => {
        if (code === 'SUCCESS') {
          const sql = `UPDATE ${table} SET ${FIELDS.ZOHO_ID} = ? WHERE ${conditionField} = ?;`;
          await sails.helpers.databaseJs.execute(connection, sql, [details.id, records[index][conditionField]]);
        }
      });
    }

    // All done.
    return exits.success();

  }


};

