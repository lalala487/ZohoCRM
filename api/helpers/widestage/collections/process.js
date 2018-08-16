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
    query: {
      defaultsTo: {},
      example: {},
      type: {},
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

    const {query, collections, dataSource, params} = inputs;


    const fields = [];
    const groupBy = [];
    const elements = [];

    const leadTable = findLeadTable(collections);


    collections.forEach(table => {
      table.columns.forEach(field => {
        elements.push(field);

        if (field.hidden != true) {
          const elementID = 'wst' + field.elementID.toLowerCase();
          const theElementID = elementID.replace(/[^a-zA-Z ]/g, '');
          fields.push(table.collectionID + '.' + field.elementName + ' as ' + theElementID);
          groupBy.push(table.collectionID + '.' + field.elementName);
        }
      });
    });

    const sql = prepareSqlQuery(fields, leadTable, collections, groupBy, query, dataSource, params);

    const connection = await sails.helpers.widestage.connection.get(dataSource);

    const result = await sails.helpers.databaseJs.query(connection, sql);

    const finalResults = getFormatedResult(elements, result);

    // All done.
    return exits.success(finalResults);

  }


};

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

function prepareSqlQuery(fields, leadTable, collections, groupBy, query, dataSource, params) {
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

  if (groupBy.length > 0) {
    sql += ' GROUP BY ';
    for (let f in groupBy) {
      sql += groupBy[f];
      if (f < (groupBy.length - 1)) {
        sql += ', ';
      }
    }
  }
  if (query.order) {
    if (query.order.length > 0) {
      let theOrderByString = '';
      query.order.forEach(theOrderField => {
        const elementID = 'wst' + theOrderField.elementID.toLowerCase();
        const theElementID = elementID.replace(/[^a-zA-Z ]/g, '');
        const theSortOrderFieldName = theOrderField.collectionID + '.' + theOrderField.elementName;
        const theOrderFieldName = theSortOrderFieldName + ' as ' + theElementID;
        let sortType = '';
        if (theOrderField.sortType == 1) {
          sortType = ' DESC';
        }
        const theIndex = fields.indexOf(theOrderFieldName);
        if (theOrderByString !== '') {
          theOrderByString += ', ';
        }
        if (theIndex >= 0) {//The order by field is in the result set
          theOrderByString += (theIndex + 1) + sortType;
        } else {//No index, the field is not in the result set
          theOrderByString += theSortOrderFieldName + sortType;
        }
      });
      if (theOrderByString !== '') {
        sql += ' ORDER BY ' + theOrderByString;
      }
    }
  }

  let pageSize;

  if (dataSource.params[0].packetSize) {
    if (dataSource.params[0].packetSize != -1) {
      pageSize = dataSource.params[0].packetSize;
    }
  } else {
    if (config.query.defaultRecordsPerPage > 1) {
      pageSize = config.query.defaultRecordsPerPage;
    }
  }

  if (typeof pageSize !== 'undefined') {
    sql = setLimitToSQL(sql, pageSize, ((params.page - 1) * pageSize));
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

function getFormatedResult(elementSchema, results) {
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

