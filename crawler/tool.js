const ethHandler = require("./ethHandler.js").EthHandler;

class Tool {
     ParseReturnValues(type, data) {
        switch (type) {
            case "uint256": 
            case "BigNumber":
                return ethHandler.hexToNumberString(data["_hex"]);
            case "address":
                return data.toLowerCase();
            default: return data;
        }
    }
}
let tool =new Tool();
module.exports.Tool = tool;
