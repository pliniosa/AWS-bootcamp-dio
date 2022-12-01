"use strict";

const {v4} = require('uuid')
const AWS = require('aws-sdk')

const insertItens = async (event) =>{
    const item = JSON.parse(event.body)
    const createdAt = new Date().toISOString();
    const id = v4()

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    const newItem = {
        id,
        item,
        createdAt,
        itemStatus: false
    }

    await dynamoDB.put({
        TableName:"ItemTable",
        Item: newItem
    })

    return {
        statusCode: 200,
        body: JSON.stringify(newItem)
    }
}

module.exports = { 
    handle:insertItens
}