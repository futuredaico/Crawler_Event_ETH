const Web3 = require("web3");

class EthHandler{
    constructor(){
        console.log("正在连接~~~~~");
        this.web3 = new Web3(
            new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/638c755c81fe495e85debe581520b373")
        );
    }

    connect()
    {
        console.log("正在重新连接~~~~~");
        this.web3 = new Web3(
            new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/638c755c81fe495e85debe581520b373")
        );
    }

    getBlockNumber(){
        return new Promise((resolve,reject)=>{
            this.web3.eth.getBlockNumber().then((blocknumber)=>{
                resolve(blocknumber);
            });
        });
    }

    getBlockInfo(blocknumber){
        return new Promise((resolve,reject)=>{
            this.web3.eth.getBlock(blocknumber).then((blockInfo)=>{
                resolve(blockInfo);
            });
        });
    }

    getBlockTime(blocknumber){
        return new Promise((resolve,reject)=>{
            this.web3.eth.getBlock(blocknumber).then((blockInfo)=>{
                resolve(blockInfo.timestamp);
            });
        });
    }

    getPastEvents(contract,eventName,options){
        return new Promise((resolve,reject)=>{
            contract.getPastEvents(eventName,options,(error, events)=>{
                if(error)
                {
                    console.log("getPastEvents error:"+error.errmsg);
                }
                resolve(events?events:[]);
            });
        });
    }
}

let ethHandler = new EthHandler();

module.exports.EthHandler = ethHandler;
