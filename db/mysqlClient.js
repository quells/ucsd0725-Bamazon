const mysql = require("mysql")

class Client {
    constructor(databaseName) {
        this.connected = false
        this.connection = null
        this.databaseName = databaseName
    }

    Connect() {
        this.connection = mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "",
            database: this.databaseName
        })
        return new Promise((resolve, reject) => {
            this.connection.connect(err => {
                if (err) return reject(err)
                this.connected = true
                resolve(true)
            })
        })
    }

    Disconnect() {
        if (this.connected) {
            this.connected = false
            this.connection.end()
        }
    }

    Query(stmt, values) {
        values = values || []
        return new Promise((resolve, reject) => {
            if (!this.connected) reject(new Error("must connect to database before querying"))
            this.connection.query({
                sql: stmt,
                values: values
            }, (err, results, fields) => {
                if (err) return reject(err)
                resolve(results)
            })
        })
    }
}

module.exports = Client
