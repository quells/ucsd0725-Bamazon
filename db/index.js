const Client = require("./mysqlClient")
const mysqlDatabaseName = "bamazon"

module.exports = {
    Initialize: function() {
        return
    },
    GetProducts: function() {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            SELECT p.item_id, p.product_name, d.department_name, p.price, p.stock_quantity
            FROM products AS p
            JOIN departments AS d
            WHERE p.department_id = d.department_id
            ORDER BY p.item_id
        `))
        .catch(console.error)
        .then(results => {
            client.Disconnect()
            return results
        })
    },
    DepleteStock: function(id, numRemoved) {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query("SELECT p.stock_quantity FROM products AS p WHERE item_id = ?", [id]))
        .then(results => {
            if (results.length !== 1) throw new Error(`could not find product with item_id = ${id}`)
            result = results[0]
            return client.Query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [numRemoved, id])
        })
        .catch(console.error)
        .then(() => client.Disconnect())
    }
}
