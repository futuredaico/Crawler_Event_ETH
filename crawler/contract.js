var fs = require('fs');
var ethHandler = require('./ethHandler.js').EthHandler;
class Contract{
	constructor(name,hash,needGetEvents)
	{
		this.name = name;
		this.abi =JSON.parse(fs.readFileSync(`./abi/${name}.abi.json`, 'utf8'));
		this.hash = hash;
		this.needGetEvents = needGetEvents;
		console.log(`name:${this.name},hash:${this.hash}`);
		this.instance =new ethHandler.web3.eth.Contract(this.abi,this.hash);
	}
}
module.exports.Contract = Contract;