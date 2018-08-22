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
    const {grantToken} = inputs;
    let tokenPreset = false;

    setTimeout(async () => {
      console.log(`timeout and tokenPreset ${tokenPreset}`);
      if (!tokenPreset) {
        try {
          await generateToken(ZCRMRestClient, grantToken);
          return exits.success();
        } catch (e) {
          return exits.error(e);
        }
      }
    }, 5000);

    try {
      console.log('before try fetch');
      await fetchRecords(ZCRMRestClient);
      console.log('after try fetch');
      tokenPreset = true;

      return exits.success();
    } catch (e) {
      console.error(e);
    }

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

async function generateToken(ZCRMRestClient, grantToken) {
  const authResponse = await ZCRMRestClient.generateAuthTokens(null, grantToken);

  sails.log('token successfully generated');
  console.log('access token :'+authResponse.access_token);
  console.log('refresh token :'+authResponse.refresh_token);
  console.log('expires in :'+authResponse.expires_in);
}

