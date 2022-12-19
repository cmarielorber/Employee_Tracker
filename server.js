const mysql = require('mysql2');
const inquirer = require('inquirer');
require('console.table');
require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    // Your username
    user: process.env.user,
    // Your password
    password: process.env.password,
    database: 'employeeDB'
});
connection.connect((err) => {
    if (err) throw err;
    console.log(`Connected...`)
    startApp();
});

const promptMessage = {
    viewAllEmployees: "View All Employees",
    viewByDepartment: "View All Departments",
    viewByManager: "View All Employee by Manager",
    viewAllRoles: "View All Roles",
    addDepartment: "Add A Department",
    addEmployee: "Add An Employee",
    updateRole: "Update Employee's Role",
    updateEmployeeManager: "Update Employee's Manager",
    removeEmployee: "Remove An Employee",
    removeDept: "Remove a department",
    removeRole: "Remove a role",
    quit: "Quit The Program"
};

startApp = () => {
    inquirer.prompt({
        name: 'initialInquiry',
        type: 'list',
        message: 'Welcome to the employee management program. What would you like to do?',
        choices: [
            promptMessage.viewAllEmployees,
            promptMessage.viewByDepartment,
            promptMessage.viewByManager,
            promptMessage.viewAllRoles,
            promptMessage.addDepartment,
            promptMessage.addEmployee,
            promptMessage.updateRole,
            promptMessage.updateEmployeeManager,
            promptMessage.removeEmployee,
            promptMessage.removeDept,
            promptMessage.removeRole,
            promptMessage.quit
        ]
    }).then((response) => {
        switch (response.initialInquiry) {
            case promptMessage.viewAllEmployees:
                viewAllEmployees();
                break;
            case promptMessage.viewByDepartment:
                viewByDepartment();
                break;
            case promptMessage.viewByManager:
                viewByManager();
                break;
            case promptMessage.addEmployee:
                addEmployee();
                break;
            case promptMessage.removeEmployee:
                remove('delete');
                break;
            case promptMessage.updateRole:
                remove('role');
                break;
            case promptMessage.viewAllRoles:
                viewAllRoles();
                break;
            case promptMessage.quit:
                connection.end();
                break;
        }
    });
}

viewAllEmployees = () => {
    connection.query = (`SELECT e.employee_id, e.first_name, e.last_name, role.title, department.department_name, role.salary, CONCAT(m.first_name, ' ', m.last_name) manager FROM employee m RIGHT JOIN employee e ON e.manager_id = m.employee_id JOIN role ON e.role_id = role.role_id JOIN department ON department.department_id = role.department_id ORDER BY e.employee_id ASC;`, (err, res) => {
        if (err) throw err;
        console.table('\n', res, '\n');
        startApp();
    });
};

viewByDepartment = () => {
    connection.query = (`SELECT * FROM department ORDER BY department_id ASC;`, (err, res) => {
        if (err) throw err;
        console.log('\n', res, '\n');
        startApp();
    });
}

viewByManager = () => {
    connection.query = (`SELECT employee_id, first_name, last_name FROM employee ORDER BY employee_id ASC;`, (err, res) => {
        if (err) throw err;
        let managers = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.employee_id }));
        inquirer.prompt([
            {
                name: 'manager',
                type: 'list',
                message: "Which manager would you like to see the employee's of?",
                choices: managers
            },
        ]).then((response) => {
            connection.query(`Select e.employee_id, e.first_name, e.last_name, role.title, department.department_name, role.salary, CONCAT(m.first_name, ' ', m.last_name) manager FROM employee m RIGHT JOIN employee e ON e.manager_id JOIN role e.role_id = role.role_id JOIN department.department_id = role.department_id WHERE e.manager_id = ${response.manager} ORDER BY e.employee_id ASC`,
                (err, res) => {
                    if (err) throw err;
                    console.table('\n', res, '\n');
                    startApp();
                })
        })
    });
}

viewAllRoles = () => {
    connection.query = (`SELECT role.role_id, role.title, role.salary, department.department_name, department.department_id FROM role JOIN department ON role.department_id = department.department_id ORDER BY role.role_id ASC;`, (err, res) => {
        if (err) throw err;
        console.log('\n', res, '\n');
        startApp();
    })
};

addDepartment = () => {
    inquirer.prompt([
        {
            name: 'newDept',
            type: 'input',
            message: 'What department would you like to add?'
        }
    ]).then((response) => {
        connection.query(`INSERT INTO department SET ?`,
            {
                department_name: response.newDept,
            },
            (err, res) => {
                if (err) throw err;
                console.log(`\n ${response.newDept} successfully added to the database! \n`);
                startApp();
            })
    })
};


addEmployee = () => {
    connection.query(`SELECT * FROM role`, (err, res) => {
        if (err) throw err;
        let roles = res.map(role => ({ name: role.title, value: role.role_id }));
        connection.query(`SELECT * FROM employee`, (err, res) => {
            if (err) throw err;
            let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.employee_id }));
            inquirer.prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: "What is the new employee's first name?"
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: "What is the new employee's last name?"
                },
                {
                    name: 'role',
                    type: 'list',
                    message: "What is the new employee's title?",
                    choices: roles
                },
                {
                    name: 'manager',
                    type: 'list',
                    message: "Who is the new employee's manager?",
                    choices: employees
                }
            ]).then((response) => {
                connection.query(`INSERT INTO employee SET ?`,
                    {
                        first_name: response.firstName,
                        last_name: response.lastName,
                        role_id: response.role,
                        manager_id: response.manager,
                    },
                    (err, res) => {
                        if (err) throw err;
                    })
                connection.query(`INSERT INTO role SET?`,
                    {
                        department_id: response.debt,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(`\n ${response.firstName} ${response.lastName} successfully added to the database! \n`);
                        startApp();
                    })
            })
        })
    })
};

addRole = () => {
    connection.query(`SELECT * FROM department`, (err, res) => {
        if (err) throw err;
        let departments = res.map(department => ({ name: department.department_name, value: department.department_id }));
        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: "What is the role you wish to add?"
            },
            {
                name: 'salary',
                type: 'input',
                message: "What is the salary of the role you want to add?"
            },
            {
                name: 'deptName',
                type: 'list',
                message: "What deparment do you wish to add the new role to?",
                choices: departments
            },
        ]).then((response) => {
            connection.query(`INSERT INTO role SET ?`,
                {
                    title: response.title,
                    salary: response.salary,
                    department_id: response.deptName,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n ${response.title} successfully added to the database! \n`);
                    startApp();
                })
        })
    })

};

updateRole = () => {
    connection.query(`SELECT * FROM role;`, (err, res) => {
        if (err) throw err;
        let roles = res.map(role => ({ name: role.title, value: role.role_id }));
        connection.query(`SELECT * FROM employee;`, (err, res) => {
            if (err) throw err;
            let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.employee_id }));
            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee would you like to update the role for?',
                    choices: employees
                },
                {
                    name: 'newRole',
                    type: 'list',
                    message: "What should the employee's new role be?",
                    choices: roles
                },
            ]).then((response) => {
                connection.query(`UPDATE employee SET ? WHERE ?`),
                    [
                        { role_id: response.newRole, },
                        { employee_id: response.employee, },
                    ],
                    (err, res) => {
                        if (err) throw err;
                        console.log(`\n Successfully updated emplyee's rold in the database! \n`);
                        startApp();
                    }
            })
        })
    })
};
updateEmployeesManager = () => {
    connection.query(`SELECT * FROM employee;`, (err, res) => {
        if (err) throw err;
        let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.employee_id }));
        inquirer.prompt([
            {
                name: 'employee',
                type: 'rawlist',
                message: 'Which employee would you like to update the manager for?',
                choices: employees
            },
            {
                name: 'newManager',
                type: 'rawlist',
                message: 'Who should the employee\'s new manager be?',
                choices: employees
            },
        ]).then((response) => {
            connection.query(`UPDATE employee SET ? WHERE ?`,
                [
                    {
                        manager_id: response.newManager,
                    },
                    {
                        employee_id: response.employee,
                    },
                ],
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n Successfully updated employee's manager in the database! \n`);
                    startApp();
                })
        })
    })
};

removeADepartment = () => {
    connection.query(`SELECT * FROM department ORDER BY department_id ASC;`, (err, res) => {
        if (err) throw err;
        let departments = res.map(department => ({ name: department.department_name, value: department.department_id }));
        inquirer.prompt([
            {
                name: 'deptName',
                type: 'rawlist',
                message: 'Which department would you like to remove?',
                choices: departments
            },
        ]).then((response) => {
            connection.query(`DELETE FROM department WHERE ?`,
                [
                    {
                        department_id: response.deptName,
                    },
                ],
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n Successfully removed the department from the database! \n`);
                    startApp();
                })
        })
    })
}

removeARole = () => {
    connection.query(`SELECT * FROM role ORDER BY role_id ASC;`, (err, res) => {
        if (err) throw err;
        let roles = res.map(role => ({ name: role.title, value: role.role_id }));
        inquirer.prompt([
            {
                name: 'title',
                type: 'rawlist',
                message: 'Which role would you like to remove?',
                choices: roles
            },
        ]).then((response) => {
            connection.query(`DELETE FROM role WHERE ?`,
                [
                    {
                        role_id: response.title,
                    },
                ],
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n Successfully removed the role from the database! \n`);
                    startApp();
                })
        })
    })
}

removeAnEmployee = () => {
    connection.query(`SELECT * FROM employee ORDER BY employee_id ASC;`, (err, res) => {
        if (err) throw err;
        let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.employee_id }));
        inquirer.prompt([
            {
                name: 'employee',
                type: 'rawlist',
                message: 'Which employee would you like to remove?',
                choices: employees
            },
        ]).then((response) => {
            connection.query(`DELETE FROM employee WHERE ?`,
                [
                    {
                        employee_id: response.employee,
                    },
                ],
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n Successfully removed the employee from the database! \n`);
                    startApp();
                })
        })
    })
}

viewDepartmentSalary = () => {
    connection.query(`SELECT * FROM department ORDER BY department_id ASC;`, (err, res) => {
        if (err) throw err;
        let departments = res.map(department => ({ name: department.department_name, value: department.department_id }));
        inquirer.prompt([
            {
                name: 'deptName',
                type: 'rawlist',
                message: 'Which department would you like to view the total salaries of?',
                choices: departments
            },
        ]).then((response) => {
            connection.query(`SELECT department_id, SUM(role.salary) AS total_salary FROM role WHERE ?`,
                [
                    {
                        department_id: response.deptName,
                    },
                ],
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n The total utilized salary budget of the ${response.deptName} department is $ \n`);
                    console.table('\n', res, '\n');
                    startApp();
                })
        })
    })
}

module.exports = connection;