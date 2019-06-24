const MongoClient = require('mongodb').MongoClient;
const config = require('./config.js');

class MongoHelper {
    constructor() {

    }
    ConnectToDB() {
        return new Promise((resolve, reject) => {
            this.collections = new Map();
            //链接数据库
            let client = new MongoClient(mongodburl, { useNewUrlParser: true });
            client.connect((err, _db) => {
                this.db = _db.db(mongodb_Db);
                //默认的库
                this.collections.set("counter", this.db.collection("counter"));
                this.collections.set("errors", this.db.collection("errors"));
                this.collections.set("events", this.db.collection("events"));
                this.collections.set("contracts",this.db.collection("contracts"));
                this.collections.get("counter").createIndexes([{ key: { lastIndex: 1 }, name: "i_lastIndex" }, { key: { counter: 1 }, name: "i_counter_unique", unique: true }], () => {
                    this.collections.get("events").createIndexes([{ key: { id: 1 }, name: "i_id_unique", unique: true }], () => {
                        this.collections.get("contracts").createIndexes([{ key: { contractName: 1,contractHash:1 }, name: "i_contractName_contractHash_unique", unique: true }], () => {
                            resolve();
                        });
                    });
                });
            });
        });
    }

    registerColl(tableName){
        this.collections.set(tableName, this.db.collection(tableName));
    }

    find(coll, filter) {
        return new Promise((resolve, reject) => {
            coll.find(filter).toArray((err, result) => {
                if (err) {
                    console.log("find error:"+ err.errmsg);
                }
                resolve(result);
            });
        });
    }

    insertOne(coll, data) {
        return new Promise((resolve, reject) => {
            coll.insertOne(data, (err, res) => {
                if (err) {
                    console.log("insertOne error:"+ err.errmsg);
                }
                resolve(res);
            })
        });
    }

    updateOne(coll, where, data) {
        return new Promise((resolve, reject) => {
            coll.updateOne(where, data, (err, res) => {
                if (err) {
                    console.log("update error:"+ err.errmsg);
                }
                resolve(res);
            });
        });
    }
}
let mongoHelper = new MongoHelper();
module.exports.MongoHelper = mongoHelper;