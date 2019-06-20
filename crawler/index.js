const ethHandler = require("./ethHandler.js").EthHandler;
const manager = require("./manager.js").Manager;
const schedule = require("node-schedule");
const mongodbHelper = require("./mongodbHelper.js").MongoHelper;
const Tool = require("./tool.js").Tool;


var scheduleCronstyle = async () => {
    await manager.init();
    let contracts = manager.contracts;
    let rule = new schedule.RecurrenceRule();
    rule.second = [1, 11, 21, 31, 41, 51];
    schedule.scheduleJob(rule, async () => {
        try {
            let blockindex = await ethHandler.getBlockNumber();
            console.log("当前的高度---链上：" + blockindex);
            let result = await mongodbHelper.find(mongodbHelper.collections.get("counter"), { "counter": "blockNumber" });
            let blockindex_db = result.length > 0 ? result[0]["lastIndex"] : 0;
            console.log("当前的高度---数据库：" + blockindex_db);
            if (blockindex <= blockindex_db)
                return;
            contracts.forEach(async (value, key, map) => {
                let contract = value;
                for (var n = 0; n < contract.needGetEvents.length; n++) {
                    let needGetEvent = contract.needGetEvents[n];
                    let events = await ethHandler.getPastEvents(contract.instance, needGetEvent.eventName, {
                        filter: {},
                        fromBlock: blockindex_db,
                        toBlock: blockindex
                    });
                    for (var m = 0; m < events.length; m++) {
                        let event = events[m];
                        let transactionHash = event.transactionHash;
                        let blockNumner = event.blockNumber;
                        //获取高度时间
                        let blockTime = await ethHandler.getBlockTime(blockNumner);
                        let address = event.address.toLowerCase();
                        let eventName = event.event;
                        let values = [];
                        let id = event.id;
                        for (var l = 0; l < needGetEvent.Values.length; l++) {
                            let returnValues = Tool.ParseReturnValues(needGetEvent.Values[l], event.returnValues[l]);
                            values.push({ "type": needGetEvent.Values[l], "value": returnValues});
                        }
                        let data = {
                            id,
                            blockNumner,
                            blockTime,
                            transactionHash,
                            address,
                            eventName,
                            values
                        };
                        await mongodbHelper.insertOne(mongodbHelper.collections.get("events"), data);


                        //特殊处理一个event
                        if (contract.name == "jump" && eventName == "OnCreate") {
                            await mongodbHelper.insertOne(mongodbHelper.collections.get("contracts"), { "contractName": "fundPool", "contractHash": values[3]["value"] });
                            await mongodbHelper.insertOne(mongodbHelper.collections.get("contracts"), { "contractName": "vote", "contractHash": values[4]["value"] });
                        }
                    }
                }
            });
            if (blockindex_db == 0)
                await mongodbHelper.insertOne(mongodbHelper.collections.get("counter"), { "counter": "blockNumber", "lastIndex": blockindex });
            else
                await mongodbHelper.updateOne(mongodbHelper.collections.get("counter"), { "counter": "blockNumber" }, { $set: { "lastIndex": blockindex } });
        }
        catch (error) {
            console.log(error);
            ethHandler.connect();
        }

    });
}


let start = async () => {
    await mongodbHelper.ConnectToDB();
    console.log("开始进行获取event任务");
    scheduleCronstyle();
}
start();