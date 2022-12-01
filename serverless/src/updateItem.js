"use strict";

const AWS = require('aws-sdk');
const updateItem = async (event) => {
    const {itemStatus} = JSON.parse(event.body)
    const {id} = event.pathParameters

    const dynamoDB = new AWS.DynamoDB.DcoumentClient();

    await dynamoDB.update({
        tableName: 'ItemTable',
        key: {id},
        UPdateExpression: 'set itemStatus = :itemStatus',
        ExpressionAttributeValue: {
            ':itemStatus' : itemStatus
        },
        ReturnValues: 'ALL_NEW'
    }).promise()

    return {
        statusCode: 200,
        body: JSON.stringify({msg: 'Item updated'})
    }
}

module.exports = {
    handler:updateItem
}