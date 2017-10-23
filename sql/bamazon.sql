drop database if exists bamazon;
create database bamazon;
use bamazon;

drop table if exists products;
drop table if exists departments;

create table departments (
	department_id integer(11) auto_increment primary key not null,
	department_name varchar(50) not null,
	overhead_costs decimal(10,2) not null default 0
);

create table products (
	item_id integer(11) auto_increment primary key not null,
	product_name varchar(100) not null,
	department_id integer(11) not null,
	price decimal(10,2) not null default 0,
	stock_quantity integer(11) not null default 0,
	product_sales decimal(10,2) not null default 0,
	index by_department (department_id),
	index inventory (stock_quantity),
	foreign key (department_id) references departments(department_id)
);

insert into departments
(department_name, overhead_costs)
values
('Produce', 4000), -- 1
('Meat', 6000),    -- 2
('Baking', 2000),  -- 3
('Dairy', 5000),   -- 4
('Other', 3000)    -- 5
;

insert into products
(product_name, department_id, price, stock_quantity, product_sales)
values
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
('Gum',    5, 1.19, 6000, 7140),
('Ground Beef',   2, 3.19, 1000, 3190),
('Ground Turkey', 2, 2.79, 1750, 4882.50)
;

-- customer/manager view
select p.item_id, p.product_name, d.department_name, p.price, p.stock_quantity
from products as p
inner join departments as d
where p.department_id = d.department_id
order by p.item_id;

-- supervisor view
select d.department_id, d.department_name,
d.overhead_costs, s.total_sales,
s.total_sales - d.overhead_costs as revenue
from departments as d
join (
	select department_id, sum(product_sales) as total_sales
	from products
	group by department_id
) as s
on d.department_id = s.department_id
order by revenue desc;
