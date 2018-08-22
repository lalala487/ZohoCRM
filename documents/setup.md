1. DB
    1. Configure data tables
        1. Create DB for new imported data
        2. Import data, which you wanna import, into tables (Separate tables for every new instance)
        3. Add **z_id** column to every instance table. Here will be saved inserted Zoho record ids
    2. Create table for Zoho token management system
        1. Create DB with name `zohooauth`
        2. Create table `oauthtokens` by running script **CREATE TABLE \`oauthtokens\` ( \`useridentifier\` varchar(255) NOT NULL, \`accesstoken\` varchar(255) NOT NULL, \`refreshtoken\` varchar(255) NOT NULL, \`expirytime\` bigint(20) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8**
            - Please notice if there is an old `oauthtokens` table you should get rid of it in some way
2. Widestage
    1. Add connection to prepared DB
    2. Prepare data layer
        1. Create layer with name which is equal to Zoho module API name: Contacts, Deals (not Potentials), CustomModule5 (not Transactions) etc
        2. Configure Data layer
            1. Add all DB tables fields which you wanna import to layer elements
            2. Add unique DB field to layer elements and set its title to **UNIQUE_IMPORT**
    3. Do points 1-2 for all modules you wanna import
3. Sails
    1. Configure SDK connection to Zoho
        1. Create API client
            1. Go to [developer console]
            2. Create new API client
                1. Click **Add Client ID**
                2. Fill required fields with actual data
                    1. Enter any valid domain and redirect (you will use it on setup SDK properties)
                    2. Leave **Client type** `Web based` 
                3. Click **Create**
        2. Setup Client properties in code
            1. Go to folder `[PROJECT_PATH]resources/`
            2. In another tab open [Node js SDK doc] and go to Configuration section
            3. Setup **configuration.properties**
                1. Fill `api.user_identifier` with value of user email which is used to enter to Zoho
                2. Provide DB credentials in **[mysql]** section
            3. Setup **oauth_configuration.properties**
                1. Find created client in [developer console] and go to **Edit** action: open extra actions (three vertical points) and click **Edit**
                2. Fill `clientid`, `clientsecret` and `redirecturl` with appropriate values
        3. Setup API token
            1. Find created client in [developer console] and go to **Self client** action
            2. Enter scopes `ZohoCRM.modules.ALL,ZohoCRM.settings.ALL` to the **Scope** field
            3. Press **View code** and copy it to future use in `[GRANT_TOKEN]`
                - Please notice that it'll expire in 1-10 minutes: accordingly to selected value in generate form
            4. Go to url `/zoho/token/check-or-generate?grantToken=[GRANT_TOKEN]`
    2. Go to `/modules`
    3. Select modules you wanna import and press submit.
        - **Please notice**: if you already have imported this module, fields data won't be rewritten
            - You should have configured data layer for selected module.
                - Maybe it's a nice idea to adjust Layer names accordingly to actual Zoho module names at this step
            - If you need to rewrite them, go to target DB and drop table `[Zoho_module]_fields`
4. WideStage
    1. Create mapping layers
        1. Create layer with name `[Zoho_module]_mapping`
        2. Add to the layer all used for data tables and `[Zoho_module]_fields` table.
        3. Join each data field with appropriate field in `[Zoho_module]_fields` table
            1. If you wanna setup lookup from joined in data layer field, just add join with `z_id` from joined table with required Lookup field in Zoho: `Contact_Name` etc. 


[developer console]: https://accounts.zoho.com/developerconsole
[Node js SDK doc]: https://www.zoho.com/crm/help/developer/server-side-sdks/node-js.html
