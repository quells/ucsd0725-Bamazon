const Client = require("./mysqlClient")
const mysqlDatabaseName = "bamazon"

module.exports = {
    Initialize: function() {
        return
    },
    GetDepartments: function() {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            SELECT department_id, department_name
            FROM departments
            ORDER BY department_id
        `))
        .catch(console.error)
        .then(results => {
            client.Disconnect()
            return results
        })
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
    GetLowInventoryProducts: function(threshold) {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            SELECT p.item_id, p.product_name, d.department_name, p.price, p.stock_quantity
            FROM products AS p
            JOIN departments AS d
            WHERE p.department_id = d.department_id
            AND p.stock_quantity < ?
            ORDER BY p.item_id;
        `, [threshold]))
        .catch(console.error)
        .then(results => {
            client.Disconnect()
            return results
        })
    },
    SellProduct: function(id, numRemoved) {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            UPDATE products SET
            stock_quantity = stock_quantity - ?,
            product_sales = product_sales + ? * price
            WHERE item_id = ?
        `, [numRemoved, numRemoved, id]))
        .catch(console.error)
        .then(() => client.Disconnect())
    },
    AddInventory: function(id, quantity) {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            UPDATE products SET
            stock_quantity = stock_quantity + ?
            WHERE item_id = ?
        `, [quantity, id]))
        .catch(console.error)
        .then(() => client.Disconnect())
    },
    CreateProduct: function(product_name, department_id, price) {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            INSERT INTO products
            (product_name, department_id, price)
            VALUE (?, ?, ?)
        `, [product_name, department_id, price]))
        .catch(console.error)
        .then(() => client.Disconnect())
    }
}
