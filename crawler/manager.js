var fs = require('fs');
var Contract = require('./contract.js').Contract;
const MongoHelper = require("./mongodbHelper.js").MongoHelper;
const schedule = require("node-schedule");


class Manager {
        constructor() {
        }

        init() {
                return new Promise(async (resolve, reject) => {
                        this.contracts = new Map();
                        this.job = new Map();
                        this.counter = new Map();
                        //读取所有的配置
                        let filesNames = fs.readdirSync("./config/");
                        for (var i = 0; i < filesNames.length; i++) {
                                let fileName = filesNames[i];
                                let data = fs.readFileSync(`./config/${fileName}`, "utf8");
                                let contractName = fileName.split('.')[0];
                                let Json = JSON.parse(data);
                                if (contractName != Json.name) {
                                        throw new Error("配置错误");
                                }
                                let contractHash = Json.hash;
                                let tableName = Json.tableName;
                                if (contractHash) {
                                        let contract = new Contract(contractName, contractHash, Json.needGetEvents);
                                        if (!this.contracts.has(contractHash))
                                                this.contracts.set(contractHash, contract);
                                }
                                else if (tableName) {
                                        this.job.set(contractName, Json);
                                        console.log(`正在从数据库读取   ${contractName}   的所有合约`);
                                        //先获取已有的合约hash
                                        let _contracts = await MongoHelper.find(MongoHelper.collections.get("contracts"), { contractName: contractName });
                                        console.log(`读取   ${contractName}   的合约完毕，总共有${_contracts.length}`);
                                        for (var n = 0; n < _contracts.length; n++) {
                                                contractHash = _contracts[n]["contractHash"];
                                                let contract = new Contract(contractName, contractHash, Json.needGetEvents);
                                                if (!this.contracts.has(contractHash)){
                                                        this.contracts.set(contractHash, contract);
                                                        console.log(`成功注册contractName：${contractName},contractHash:${JSON.stringify(contractHash)}`);
                                                }
                                        }
                                        //记录下这个名字的合约已经记录了多少个
                                        this.counter.set(contractName, _contracts.length);
                                }
                        }
                        this.scheduleJob();
                        resolve();
                });
        }

        scheduleJob() {
                let rule = new schedule.RecurrenceRule();
                rule.second = [1, 11, 21, 31, 41, 51];
                schedule.scheduleJob(rule, async () => {
                        this.job.forEach(async(value, key, map) => {
                                let contractName = key;
                                let Json = value;
                                let contracts = await MongoHelper.find(MongoHelper.collections.get("contracts"), { contractName: contractName });
                                if (contracts.length != this.counter.get(contractName)) {
                                        for (var i = 0; i < contracts.length; i++) {
                                                let contractHash = contracts[i]["contractHash"];
                                                if (!this.contracts.has(contractHash)) {
                                                        console.log(`添加了 contractName:${contractName},contractHash:${contractHash}`);
                                                        let contract = new Contract(contractName, contractHash, Json.needGetEvents);
                                                        this.contracts.set(contractHash, contract);
                                                }
                                        }
                                }
                        });
                });
        }
}
let manager = new Manager();
module.exports.Manager = manager;