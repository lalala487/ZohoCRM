module.exports = {


  friendlyName: 'Check or generate',


  description: '',


  inputs: {
    grantToken: {
      example: 'I am token',
      type: 'string',
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const ZCRMRestClient = await sails.helpers.zoho.client.get();
    try {
      /*
      await fetchRecords(ZCRMRestClient)
      */
      const authResponse = await ZCRMRestClient.generateAuthTokens(null, inputs.grantToken);

      sails.log('token successfully generated');
      console.log('access token :'+authResponse.access_token);
      console.log('refresh token :'+authResponse.refresh_token);
      console.log('expires in :'+authResponse.expires_in);
    } catch (e) {
    }

    // All done.
    return exits.success();

  }


};

async function fetchRecords(ZCRMRestClient) {
  const input = {};
  input.module = 'Leads';
  const params = {};
  params.page = 0;
  params.per_page = 5;
  input.params = params;
  return await ZCRMRestClient.API.MODULES.get(input);
}

