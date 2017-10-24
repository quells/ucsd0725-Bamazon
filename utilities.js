const table = require("table")

module.exports = {
    IsANumber: function(input) {
        return Number(input) > 0
    },
    TableOptions: function() {
        return {
            border: table.getBorderCharacters(`void`),
            drawJoin: () => { return false },
            columnDefault: {
                paddingLeft: 0,
                paddingRight: 1,
                alignment: "left"
            },
        }
    },
    CopyObject: function(obj) {
        return JSON.parse(JSON.stringify(obj))
    }
}
