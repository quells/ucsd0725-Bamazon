const Client = require("./mysqlClient")
const mysqlDatabaseName = "bamazon"

module.exports = {
    Initialize: function() {
        var client = new Client("")
        return client.Connect()
        .then(() => client.Query(`DROP DATABASE IF EXISTS ${mysqlDatabaseName}`))
        .then(() => client.Query(`CREATE DATABASE ${mysqlDatabaseName}`))
        .then(() => client.Query(`USE ${mysqlDatabaseName}`))
        .then(() => client.Query("DROP TABLE IF EXISTS departments"))
        .then(() => client.Query("DROP TABLE IF EXISTS products"))
        .then(() => client.Query(`
            CREATE TABLE departments (
                department_id INTEGER(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
                department_name VARCHAR(50) NOT NULL,
                overhead_costs DECIMAL(10, 2) NOT NULL DEFAULT 0
            )
        `))
        .then(() => client.Query(`
            CREATE TABLE products (
                item_id INTEGER(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
                product_name VARCHAR(100) NOT NULL,
                department_id INTEGER(11) NOT NULL,
                price DECIMAL(10,2) NOT NULL DEFAULT 0,
                stock_quantity INTEGER(11) NOT NULL DEFAULT 0,
                product_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
                INDEX by_department (department_id),
                INDEX inventory (stock_quantity),
                FOREIGN KEY (department_id) REFERENCES departments(department_id)
            )
        `))
        .catch(console.error)
        .then(() => client.Disconnect())
    },
    LoadExampleData: function() {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            INSERT INTO departments
            (department_name, overhead_costs)
            VALUES
            ('Produce', 4000),
            ('Meat', 6000),
            ('Baking', 2000),
            ('Dairy', 5000)
        `))
        .then(() => client.Query(`
            INSERT INTO products
            (product_name, department_id, price, stock_quantity, product_sales)
            VALUES
            ('Bacon',  2, 1.99, 1500, 2985),
            ('Banana', 1, 0.19, 8000, 1520),
            ('Butter', 4, 1.49, 3200, 4768),
            ('Carrot', 1, 2.59, 2000, 5180),
            ('Chicken',2, 4.99,  400, 1996),
            ('Egg',    4, 2.09, 4500, 9405),
            ('Flour',  3, 3.49, 2000, 6980),
            ('Kale',   1, 3.79,  500, 1895),
            ('Milk',   4, 3.29, 4000,13160),
            ('Sugar',  3, 2.99, 1800, 5382),
            ('Ground Beef',   2, 3.19, 1000, 3190),
            ('Ground Turkey', 2, 2.79, 1750, 4882.50)
        `))
        .catch(console.error)
        .then(() => client.Disconnect())
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
    },
    ChangeProductPrice: function(item_id, newPrice) {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            UPDATE products SET
            price = ?
            WHERE item_id = ?
        `, [newPrice, item_id]))
        .catch(console.error)
        .then(() => client.Disconnect())
    },
    GetDepartmentSales: function() {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            SELECT d.department_id, d.department_name, d.overhead_costs,
            coalesce(s.total_sales, 0) AS total_sales,
            coalesce(s.total_sales, 0) - d.overhead_costs AS profits
            FROM departments AS d
            LEFT JOIN (
                SELECT department_id, sum(product_sales) as total_sales
                FROM products
                GROUP BY department_id
            ) AS s
            ON d.department_id = s.department_id
            ORDER BY d.department_id
        `))
        .catch(console.error)
        .then(results => {
            client.Disconnect()
            return results
        })
    },
    CreateDepartment: function(department_name, overhead) {
        var client = new Client(mysqlDatabaseName)
        return client.Connect()
        .then(() => client.Query(`
            INSERT INTO departments
            (department_name, overhead_costs)
            VALUE (?, ?)
        `, [department_name, overhead]))
        .catch(console.error)
        .then(() => client.Disconnect())
    },
}
