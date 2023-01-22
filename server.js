const inquirer = require("inquirer");
const mysql = require('mysql2');
const consoleTable = require('console.table');
require('dotenv').config();

// connect to db (use .env to protect password)
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'employee_db'
    },
    console.log('Connected to the employee database.')
);

// options menu upon start of application
const menu = () => {
    inquirer.prompt(
        [
            {
                type: 'list',
                name: 'menu_options',
                message: 'What would you like to do?',
                choices: ['View all departments.', 'View all roles.', 'View all employees.', 'Add a department.', 'Add a role.', 'Add an employee.', 'Update an employee role.']
            }
        ]
    )
        .then((response) => {
            switch (response.menu_options) {
                case 'View all departments.':
                    viewDepartments()
                    break;
                case 'View all roles.':
                    viewRoles()
                    break;
                case 'View all employees.':
                    viewEmployees()
                    break;
                case 'Add a department.':
                    addDepartment()
                    break;
                case 'Add a role.':
                    addRole()
                    break;
                case 'Add an employee.':
                    addEmployee()
                    break;
                case 'Update an employee role.':
                    updateEmpmloyee()
                    break;
            }
        })
}

// view queries
const viewDepartments = () => {
    db.query("SELECT * FROM department", function (err, results) {
        console.table(results);
        menu();
    });
}

const viewRoles = () => {
    db.query("SELECT * FROM role", function (err, results) {
        console.table(results);
        menu();
    });
}

const viewEmployees = () => {
    db.query("SELECT * FROM employee", function (err, results) {
        console.table(results);
        menu();
    });
}

// add queries
function addDepartment() {
    inquirer.prompt([
        {
            name: 'new_department',
            type: 'input',
            message: 'Name of new department.'
        },
    ]).then((response) => {
        db.query('INSERT INTO department SET ?;', {
            name: response.new_department
        });
        console.log('---------------------')
        console.log('New department added!')
        console.log('---------------------')
        menu();
    })
}

function addRole() {

    db.query('SELECT * FROM department;', function (err, departments) {
        if (err) throw err

        inquirer.prompt([
            {
                name: 'new_role',
                type: 'input',
                message: 'Enter new role.'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Enter salary for new role. (no commas)'
            },
            {
                name: 'department',
                type: 'list',
                message: 'Enter department for new role.',
                choices: departments.map(({ id, name }) => ({ name: name, value: id }))
            }
        ]).then((response) => {
            db.query('INSERT INTO role SET ?;', {
                title: response.new_role,
                salary: response.salary,
                department: response.department
            });
            console.log('---------------')
            console.log('New role added!')
            console.log('---------------')
            menu();
        })
    })
}

function addEmployee() {

    db.query('SELECT * FROM role;', function (err, roles) {
        if (err) throw err

        db.query('SELECT * FROM employee;', function (err, employees) {
            if (err) throw err

            inquirer.prompt([
                {
                    name: 'new_first_name',
                    type: 'input',
                    message: "Enter new employee's first name."
                },
                {
                    name: 'new_last_name',
                    type: 'input',
                    message: "Enter new employee's last name."
                },
                {
                    name: 'role',
                    type: 'list',
                    message: "New employee's role.",
                    choices: roles.map(({ id, title }) => ({ name: title, value: id }))
                },
                {
                    name: 'manager',
                    type: 'list',
                    message: "Select employee's manager, if applicable.",
                    choices: employees.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }))
                }
            ]).then((response) => {
                db.query('INSERT INTO employee SET ?;', {
                    first_name: response.new_first_name,
                    last_name: response.new_last_name,
                    role_id: response.role,
                    manager_id: response.manager,
                });
                console.log('-------------------')
                console.log('New employee added!')
                console.log('-------------------')
                menu();
            });
        })
    }
    )
}

// update queries
function updateEmpmloyee() {

    db.query('SELECT * FROM employee;', function (err, employees) {
        if (err) throw err

        db.query('SELECT * FROM role;', function (err, roles) {
            if (err) throw err

            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Select which employee you want to update.',
                    choices: employees.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }))
                },
                {
                    name: 'new_role',
                    type: 'list',
                    message: "Select emplyee's new role.",
                    choices: roles.map(({ id, title }) => ({ name: title, value: id }))
                }
            ]).then((response) => {
                db.query('UPDATE employee SET ? WHERE ?;', [
                        {role_id: response.new_role},
                        {id: response.employee}
                    ]);
                console.log('-----------------')
                console.log('Employee updated!')
                console.log('-----------------')
                menu();
            });
        })
    })
}

menu()
