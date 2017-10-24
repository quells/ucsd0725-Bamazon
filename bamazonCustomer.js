const inq = require("inquirer")
const table = require("table")
const color = require("cli-color")
const db = require("./db")
const utilities = require ("./utilities")

class Customer {
    constructor() {
        this.cart = {}
    }

    addToCart(quantity, id, name, price) {
        if (this.cart[id] === undefined) {
            this.cart[id] = {
                id: id,
                quantity: quantity,
                name: name,
                price: price
            }
        } else {
            this.cart[id].quantity += quantity
        }
    }

    removeFromCart(quantity, id) {
        if (this.cart[id] === undefined) return
        this.cart[id].quantity -= quantity
        if (this.cart[id].quantity <= 0) {
            delete this.cart[id]
        }
    }

    totalBill() {
        var sum = 0
        var receipt = [["Quantity", "Item", "Unit Price", "Total Price"]]
        for (var id in this.cart) {
            var item = this.cart[id]
            var itemTotal = item.quantity * item.price
            sum += itemTotal
            receipt.push([item.quantity, item.name, item.price.toFixed(2), itemTotal.toFixed(2)])
        }
        receipt.push(["", "", "", sum.toFixed(2)])
        var tableOptions = utilities.TableOptions()
        tableOptions.columnDefault.alignment = "right"
        tableOptions.columns = { 1: {alignment: "left"} }
        receipt = table.table(receipt, tableOptions)
        return {
            amount: sum,
            receipt: receipt
        }
    }

    askWhatToDo() {
        inq.prompt([{
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["Add to Cart", "Remove from Cart", "View Cart", "Checkout", "Exit"]
        }])
        .then(answer => {
            switch (answer.action) {
                case "Add to Cart":
                    this.askToAddToCart()
                    break
                case "Remove from Cart":
                    if (Object.keys(this.cart).length < 1) {
                        console.log("Your cart is empty.")
                        this.askWhatToDo()
                    } else {
                        this.askToRemoveFromCart()
                    }
                    break
                case "View Cart":
                    console.log(this.totalBill().receipt)
                    this.askWhatToDo()
                    break
                case "Checkout":
                    var p = Promise.resolve()
                    for (var id in this.cart) {
                        p = p.then(() => db.SellProduct(id, this.cart[id].quantity))
                    }
                    p = p.then(() => console.log(`Your total is $${this.totalBill().amount.toFixed(2)}. Thank you, come again!`))
                    break
                case "Exit":
                    console.log("You did not complete your purchase. Goodbye!")
                    break
                default:
                    console.error("unhandled customer action")
            }
        })
    }

    askToAddToCart() {
        displayAvailableItems()
        .then(items => {
            return inq.prompt([{
                type: "input",
                name: "id",
                message: "Enter ID of item you wish to purchase",
                validate: function(input) {
                    return items.filter(i => i.item_id == input).length > 0
                }
            },{
                type: "input",
                name: "quantity",
                message: "How many do you want?",
                validate: utilities.IsANumber
            }])
            .then(answers => {
                var item = items.filter(i => i.item_id == answers.id)[0]
                var quantity = Math.floor(Number(answers.quantity))
                if (quantity > item.stock_quantity) {
                    console.log(color.red(`The store does not have enough ${item.product_name} to fulfill this order.`))
                } else {
                    this.addToCart(quantity, item.item_id, item.product_name, item.price)
                }
                this.askWhatToDo()
            })
        })
    }

    askToRemoveFromCart() {
        var items = Object.keys(this.cart).map(id => this.cart[id])
        inq.prompt([{
            type: "list",
            name: "product_name",
            message: "Which item would you like to remove?",
            choices: items.map(i => i.name)
        }])
        .then(answer => {
            var item = items.filter(i => i.name === answer.product_name)[0]
            inq.prompt([{
                type: "input",
                name: "quantity",
                message: "How many would you like to remove?",
                validate: function(input) {
                    return Number(input) >= 0 && Number(input) <= item.quantity
                }
            }])
            .then(answer => {
                this.removeFromCart(answer.quantity, item.id)
                this.askWhatToDo()
            })
        })
    }
}

function displayAvailableItems() {
    return db.GetProducts()
    .then(results => {
        var items = results.map(r => [r.item_id, r.product_name, `$${r.price.toFixed(2)}`])
        var data = [["ID", "Name", "Price"]].concat(items)
        var tableOptions = utilities.TableOptions()
        tableOptions.columns = { 2: {alignment: "right"} }
        var tabulated = table.table(data, tableOptions)
        console.log("Items for sale:")
        console.log(tabulated)
        return results
    })
}

function Start() {
    var c = new Customer()
    c.askWhatToDo()
}

module.exports = {
    Start: Start
}

if (require.main === module) {
    Start()
}
