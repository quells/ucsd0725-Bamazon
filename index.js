const inq = require("inquirer")

if (require.main === module) {
    inq.prompt([{
        type: "list",
        name: "cmd",
        message: "Which mode would you like to enter?",
        choices: ["Customer", "Manager", "Supervisor"]
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
            default:
                console.error("unhandled mode")
        }
    })
}
