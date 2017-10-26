const inq = require("inquirer")

if (require.main === module) {
    inq.prompt([{
        type: "list",
        name: "cmd",
        message: "Which mode would you like to enter?",
        choices: ["Customer", "Manager", "Supervisor", "Database"]
    }])
    .then(answer => {
        switch (answer.cmd) {
            case "Customer":
                require("./bamazonCustomer").Start()
                break
            case "Manager":
                require("./bamazonManager").Start()
                break
            case "Supervisor":
                require("./bamazonSupervisor").Start()
                break
            case "Database":
                DatabaseManagementLoop()
            default:
                console.error("unhandled mode")
        }
    })
}

function DatabaseManagementLoop() {
    var db = require("./db")
    inq.prompt([{
        type: "list",
        name: "cmd",
        message: "What would you like to do?",
        choices: ["Initialize Database", "Load Example Data", "Exit"]
    }])
    .then(answer => {
        switch (answer.cmd) {
            case "Initialize Database":
                db.Initialize()
                .then(() => DatabaseManagementLoop())
                break
            case "Load Example Data":
                db.LoadExampleData()
                .then(() => DatabaseManagementLoop())
                break
            case "Exit":
                console.log("Goodbye.")
                break
            default:
                console.error("unhandled mode")
        }
    })
}
