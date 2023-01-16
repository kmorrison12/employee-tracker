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

// queries
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

function addDepartment() {
    inquirer.prompt([
        {
            name: 'new_department',
            type: 'input',
            message: 'Name of new department.'
        }
    ]).then((response) => {
        db.query('INSERT INTO department SET ?;', {
            name: response.new_department
        });
        menu();
    })
}

function addRole() {
    inquirer.prompt([
        {
            name: 'new_role',
            type: 'input',
            message: 'Enter new role.'
        }
    ]).then((response) => {
        db.query('INSERT INTO role SET ?;', {
            title: response.new_role
        });
        menu();
    })
}

function addEmployee() {
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
        ]).then((response) => {
            db.query('INSERT INTO employee SET ?;', {
            first_name: response.new_first_name,
            last_name: response.new_last_name
            });            
            
            const roles = db.query(`SELECT title FROM role;`);
            return roles[0];
        });
    inquirer.prompt([
        {
            name: 'role',
            type: 'list',
            message: "New employee's role.",
            choices: roles
        }
    ]).then((response) => {
        db.query('INSERT INTO employee SET ?;', {
            role_id: response.role
        });

        const managers = db.query('SELECT first_name, last_name FROM employee;');
        return managers[0];
    });

    inquirer.prompt([
        {
            name: 'manager',
            type: 'input',
            message: "Select employee's manager, if applicable.",
            choices: managers
        }
    ]).then((response) => {
        db.query('INSERT INTO employee SET ?;', {
            manager_id: response.manager
        });
    });
    menu();
};
        

menu();

// db.query('UPDATE employee_role SET ? WHERE ?;
