# ucsd0725-Bamazon

UCSD Coding Bootcamp HW Assignment 09

## Installation

Developed using Node 8, npm 5, and MySQL 14. Older versions not guaranteed to
work correctly.

Clone the repo and install dependencies.

```bash
git clone https://github.com/quells/ucsd0725-Bamazon.git
cd ucsd0725-Bamazon
node install
```

Start app with `npm start` and select `Database`. Select `Initialize Database`
and then `Load Example Data`. This creates a new MySQL database called `bamazon`
with tables called `products` and `departments`. It also loads values for things
typically found in a grocery store.

**WARNING** this will destroy data if another
database called `bamazon` already exists.

![Initialize Database and Load Example Data](screenshots/02%20Initialize.png)

Select `Exit` to return to the command line.

## Usage

Start app with `npm start` to show the different modes available. You can also
load a mode directly, for example with `node bamazonCustomer.js`.

More usage information for each mode:

- [Customer](readme/customer.md)
- [Manager](readme/manager.md)
- [Supervisor](readme/supervisor.md)

![Mode Menu](screenshots/01%20Database.png)
