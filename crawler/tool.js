class Tool {
    static ParseReturnValues(type, data) {
        switch (type) {
            case "uint256": 
            case "BigNumber":
                return parseInt(data["_hex"]);
            case "address":
                return data.toLowerCase();
            default: return data;
        }
    }
}
module.exports.Tool = Tool;