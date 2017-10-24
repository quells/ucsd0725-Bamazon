const inq = require("inquirer")
const table = require("table")
const color = require("cli-color")
const db = require("./db")
const utilities = require("./utilities")

class Supervisor {
    constructor() {}

    askWhatToDo() {
        inq.prompt([{
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["View Department Sales", "Create Department", "Exit"]
        }])
        .then(answer => {
            switch (answer.action) {
                case "View Department Sales":
                    db.GetDepartmentSales()
                    .then(displayDepartmentSales)
                    .then(() => this.askWhatToDo())
                    break
                case "Create Department":
                    this.askToCreateDepartment()
                    break
                case "Exit":
                    console.log("Goodbye!")
                    break
                default:
                    console.error("unhandled manager action")
            }
        })
    }

    askToCreateDepartment() {
        inq.prompt([{
            type: "input",
            name: "department_name",
            message: "What should the new department be called?"
        }, {
            type: "input",
            name: "overhead",
            message: "How much overhead does that department have?",
            validate: utilities.IsANumber
        }])
        .then(answer => {
            db.CreateDepartment(answer.department_name, answer.overhead)
            .then(() => this.askWhatToDo())
        })
    }
}

function displayDepartmentSales(results) {
    var departments = results.map(r => [r.department_id, r.department_name, r.overhead_costs.toFixed(2), r.total_sales.toFixed(2), r.profits.toFixed(2)])
    var data = [["ID", "Name", "Overhead ($)", "Total Sales ($)", "Profits ($)"]].concat(departments)
    var tableOptions = utilities.TableOptions()
    tableOptions.columns = {
        2: {alignment: "right"},
        3: {alignment: "right"},
        4: {alignment: "right"}
    }
    var tabulated = table.table(data, tableOptions)
    console.log(tabulated)
    return Promise.resolve(results)
}

function Start() {
    var s = new Supervisor()
    s.askWhatToDo()
}

module.exports = {
    Start: Start
}

if (require.main === module) {
    Start()
}
