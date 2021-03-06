module.exports = {


  friendlyName: 'Process',


  description: 'Process collections.',


  inputs: {
    dataSource: {
      example: {},
      required: true,
      type: {},
    },
    collections: {
      example: [{}],
      required: true,
      type: [{}],
    },
    params: {
      defaultsTo: {page: 1},
      example: {},
      type: {},
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {collections, dataSource, params} = inputs;


    const fields = [];
    const groupBy = [];
    const elements = [];

    const leadTable = findLeadTable(collections);

    const WIDESTAGE_LAYER = require('../../../enums/WIDESTAGE/FIELDS');

    collections.forEach(table => {
      table.columns.forEach(field => {
        elements.push(field);

        if (field.hidden != true) {
          const theElementID = sails.helpers.widestage.field.id.prepare(field);
          const fieldDBName = `${table.collectionID}.\`${field.elementName}\``;
          fields.push(fieldDBName + ' as ' + theElementID);

          if (field.elementLabel !== WIDESTAGE_LAYER.UNIQUE) {
            groupBy.push(fieldDBName);
          }
        }
      });
    });
      
     
      
    const sql = prepareSqlQuery(fields, leadTable, collections, groupBy, dataSource, params);
    
     sails.log(sql);
    const connection = await sails.helpers.widestage.connection.get(dataSource);

    const result = await sails.helpers.databaseJs.query(connection, sql);

    const finalResults = getFormattedResult(elements, result);

    // All done.
    return exits.success(finalResults);

  }


};

function get_zoho_id(collections){
    let res=null;
    collections.forEach(function(c){

        if(c["columns"]){
            c["columns"].forEach(function (col){
                if(col && col.description && col.description==="ZOHO_ID") 
                  res={collectionID:col.collectionID,elementID:col.elementID}
                
                //sails.log.debug("Found zohoId:",res);

            })
        }
    });

    return res;
}

function findLeadTable(collections) {
  let leadTable = {};
  if (collections.length == 1) {
    leadTable = collections[0];
  }

  let leadTableJoinsCount = 0;
  collections.forEach((table) => {
    table.joinsCount = 0;

    for (let j in table.joins) {
      const join = table.joins[j];
      if (join.sourceCollectionID == table.collectionID) {
        table.joinsCount = table.joinsCount + 1;
      }

      if (join.targetCollectionID == table.collectionID) {
        table.joinsCount = table.joinsCount + 1;
      }
    }

    if (table.joinsCount > leadTableJoinsCount) {
      leadTable = table;
      leadTableJoinsCount = table.joinsCount;
    }
  });

  return leadTable;
}

function prepareSqlQuery(fields, leadTable, collections, groupBy, dataSource, params) {
  let sql = 'SELECT ';
  for (let f in fields) {
    sql += fields[f];

    if (f < (fields.length - 1)) {
      sql += ', ';
    }
  }

  const leadSchema = leadTable.schema || leadTable;
  const fromSql = leadSchema.isSQL === true ? '(' + leadSchema.sqlQuery + ')' : leadSchema.collectionName;

  sql += ' FROM ' + fromSql + ' ' + leadTable.collectionID + getJoins(leadTable.collectionID, collections, []);

  
  const FIELDS = require('../../../enums/DB/FIELDS');


    const zohoid = get_zoho_id(collections);
    sails.log.debug("zoho id outside:",zohoid);
    
   
    if(zohoid){
        sql += ' WHERE '+zohoid.collectionID+'.`'+FIELDS.ZOHO_ID+'` =""'+
        ' OR '+zohoid.collectionID+'.`'+FIELDS.ZOHO_ID+'` IS NULL' ;
        
    }
      
  /*
  if (groupBy.length > 0) {
    sql += ' GROUP BY ';
    for (let f in groupBy) {
      sql += groupBy[f];
      if (f < (groupBy.length - 1)) {
        sql += ', ';
      }
    }
  }
  */

  {
    const {page, limit: pageSize} = params;
    sql = setLimitToSQL(sql, pageSize, ((page - 1) * pageSize));
  }
  //Fix for filters with having and normal filters
  sql = sql.replace('WHERE  AND', 'WHERE');
  return sql;
}

function setLimitToSQL(sql,limit,offset) {
  if (limit !== -1) {
    sql += ' LIMIT ' + offset + ', ' + limit;
  }

  return sql;
}

function getFormattedResult(elementSchema, results) {
  const finalResults = [];
  const moment = require('moment');
  results.forEach(result => {
    const newRecord = {};
    elementSchema.forEach(field => {
      if (field.elementType == 'date' && field.format) {
        result[field.id + '_original'] = result[field.id];
        if (result[field.id]) {
          const date = new Date(result[field.id]);
          result[field.id] = moment(date).format(field.format);
        }
      }
      for (let f in result) {
        newRecord[f.toLowerCase()] = result[f];
      }
    });
    finalResults.push(newRecord);
  });

  return finalResults;
}

function getJoins(collectionID, collections, processedCollections) {
  var fromSQL = '';
  collections.forEach(table => {
    if (table.collectionID == collectionID && (processedCollections.indexOf(collectionID) == -1)) {
      processedCollections.push(collectionID);


      for (let j in table.joins) {
        const join = table.joins[j];
        if (join.sourceCollectionID == table.collectionID && (processedCollections.indexOf(join.targetCollectionID) == -1)) {
          if (join.joinType == 'default') {
            fromSQL += ' INNER JOIN ';
          }
          if (join.joinType == 'left') {
            fromSQL += ' LEFT JOIN ';
          }
          if (join.joinType == 'right') {
            fromSQL += ' RIGHT JOIN ';
          }


          fromSQL += join.targetCollectionName + ' ' + join.targetCollectionID;

          fromSQL += ' ON (' + join.sourceCollectionID + '.' + join.sourceElementName + ' = ' + join.targetCollectionID + '.' + join.targetElementName + ')';
          fromSQL += getJoins(join.targetCollectionID, collections, processedCollections);
        }

        if (join.targetCollectionID == table.collectionID && (processedCollections.indexOf(join.sourceCollectionID) == -1)) {
          switch (join.joinType) {
            case 'default':
              fromSQL += ' INNER JOIN ';
              break;
            case 'left':
              fromSQL += ' LEFT JOIN ';
              break;
            case 'right':
              fromSQL += ' RIGHT JOIN ';
              break;
          }

          fromSQL += join.sourceCollectionName + ' ' + join.sourceCollectionID;

          fromSQL += ' ON (' + join.targetCollectionID + '.' + join.targetElementName + ' = ' + join.sourceCollectionID + '.' + join.sourceElementName + ')';

          fromSQL += getJoins(join.sourceCollectionID, collections, processedCollections);
        }
      }


    }

  });

  return fromSQL;

}

