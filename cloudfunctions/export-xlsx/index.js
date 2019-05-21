// 云函数入口文件
const cloud = require('wx-server-sdk')
const xlsx = require('node-xlsx').default;


cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

    return db.collection("signups").where({docid: event.docid}).get().then(res=>{
        res.result.data.map(rec => Object.values(rec));
    })

}