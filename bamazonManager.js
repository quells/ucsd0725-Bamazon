const inq = require("inquirer")
const table = require("table")
const color = require("cli-color")
const db = require("./db")
const utilities = require("./utilities")

class Manager {
    constructor() {}

    askWhatToDo() {
        inq.prompt([{
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["View Products", "View Low Inventory Products", "Add to Inventory", "Add New Product", "Exit"]
        }])
        .then(answer => {
            switch (answer.action) {
                case "View Products":
                    displayAvailableItems()
                    .then(() => this.askWhatToDo())
                    break
                case "View Low Inventory Products":
                    this.askForLowInventoryThreshold()
                    .then(displayLowInventory)
                    .then(() => this.askWhatToDo())
                    break
                case "Add to Inventory":
                    this.askToAddToInventory()
                    break
                case "Add New Product":
                    this.askToCreateNewProduct()
                    break
                case "Exit":
                    console.log("Goodbye!")
                    break
                default:
                    console.error("unhandled manager action")
            }
        })
    }

    askForLowInventoryThreshold() {
        return inq.prompt([{
            type: "input",
            name: "threshold",
            message: "What is the threshold for low inventory?",
            default: 1000,
            validate: utilities.IsANumber
        }])
        .then(answer => answer.threshold)
    }

    askToAddToInventory() {
        db.GetProducts()
        .then(results => {
            inq.prompt([{
                type: "list",
                name: "item",
                message: "Which item should be restocked?",
                choices: results.map(r => `${r.product_name}`)
            }, {
                type: "input",
                name: "quantity",
                message: "How many should be added?",
                validate: utilities.IsANumber
            }])
            .then(answers => {
                var item = results.filter(r => r.product_name === answers.item)[0]
                db.AddInventory(item.item_id, Number(answers.quantity))
                .then(() => this.askWhatToDo())
            })
        })
    }

    askToCreateNewProduct() {
        db.GetDepartments()
        .then(results => {
            inq.prompt([{
                type: "input",
                name: "product_name",
                message: "What is the new product called?"
            }, {
                type: "list",
                name: "department",
                message: "Which department does it belong in?",
                choices: results.map(r => r.department_name)
            }, {
                type: "input",
                name: "price",
                message: "How much should the new product cost?",
                validate: utilities.IsANumber
            }])
            .then(answers => {
                var department = results.filter(r => r.department_name === answers.department)[0]
                db.CreateProduct(answers.product_name, department.department_id, Number(answers.price))
                .then(() => this.askWhatToDo())
            })
        })
    }
}

function displayAvailableItems() {
    return db.GetProducts()
    .then(displayItems)
}

function displayLowInventory(threshold) {
    return db.GetLowInventoryProducts(threshold)
    .then(displayItems)
}

function displayItems(results) {
    var items = results.map(r => [r.item_id, r.product_name, `$${r.price.toFixed(2)}`, r.stock_quantity])
    var data = [["ID", "Name", "Price", "Stock"]].concat(items)
    var tableOptions = utilities.TableOptions()
    tableOptions.columns = {
        2: {alignment: "right"},
        3: {alignment: "right"}
    }
    var tabulated = table.table(data, tableOptions)
    console.log(tabulated)
    return Promise.resolve(results)
}

function Start() {
    var m = new Manager()
    m.askWhatToDo()
}

module.exports = {
    Start: Start
}

if (require.main === module) {
    Start()
}
