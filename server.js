const mysql = require('mysql2');
const inquirer = require('inquirer');
require('console.table');
require('dotenv').config();

const connection = mysql.createConnection(
    {
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: 'localhost',
        port: 3306
    }
);

connection.connect((err) => {
    if (err) throw err;
    console.log(`Connected as id ${connection.threadId} \n`);
    startApp();
});

const startApp = () => {
    inquirer.prompt([
        {
            name: 'initialInquiry',
            type: 'rawlist',
            message: 'Welcome to the employee management program. What would you like to do?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'View all employees by manager', 'Add a department', 'Add a role', 'Add an employee', 'Update employee\'s role', 'Update employee\'s manager', 'Remove a department', 'Remove a role', 'Remove an employee', 'View total salary of department', 'Exit program']
        }
    ]).then((res) => {
        switch (res.initialInquiry) {
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'View all employees by manager':
                viewByManager();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update employee\'s role':
                updateRole();
                break;
            case 'Update employee\'s manager':
                updateEmployeesManager();
                break;
            case 'Remove a department':
                removeDepartment();
                break;
            case 'Remove a role':
                removeRole();
                break;
            case 'Remove an employee':
                removeEmployee();
                break;
            case 'View total salary of department':
                viewDepartmentSalary();
                break;
            case 'Exit program':
                connection.end();
                console.log('\n You have exited the employee management program. Thanks for using! \n');
                return;
            default:
                break;
        }
    })
}


const viewAllDepartments = () => {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        console.table(res);
        startApp();
    });
}

const viewByManager = () => {
    connection.query(`SELECT * FROM employee  `, (err, res) => {
        if (err) throw err;
        let managers = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.employee_id }));
        inquirer.prompt([
            {
                name: 'manager',
                type: 'list',
                message: "Which manager would you like to see the employee's of?",
                choices: managers
            },
        ]).then((res) => {
            connection.query(`SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, employee.first_name, employee.last_name FROM employee LEFT JOIN employee manager ON manager.id = employee.manager_id ORDER BY manager`,
                (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    startApp();
                })
        })
    });
}

const viewAllRoles = () => {
    connection.query("select * from role", (err, res) => {
        if (err) throw err;
        console.table(res);
        startApp();
    });
};

const viewAllEmployees = () => {
    connection.query(`SELECT * FROM employee_db.employee`, (err, res) => {
        if (err) throw err;
        console.table(res);
        startApp();
    })
};

const addDepartment = () => {
    inquirer.prompt([
        {
            name: 'newDept',
            type: 'input',
            message: 'What department would you like to add?'
        }
    ]).then((res) => {
        connection.query(`INSERT INTO department SET ?`,
            {
                name: res.newDept,
            },
            (err, res) => {
                if (err) throw err;
                console.log(`\n Successfully added to the database! \n`);
                startApp();
            })
    })
};


const addEmployee = () => {
    connection.query(`SELECT * FROM role`, (err, res) => {
        if (err) throw err;
        console.log(res)
        let roles = res.map(role => ({ name: role.title, value: role.id }));
        connection.query(`SELECT * FROM employee`, (err, res) => {
            if (err) throw err;
            let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));
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
            ]).then((res) => {
                connection.query(`INSERT INTO employee SET ?`,
                    {
                        first_name: res.firstName,
                        last_name: res.lastName,
                        role_id: res.role,
                        manager_id: res.manager,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(`\n Successfully added to the database! \n`);
                        startApp();
                    })
            })
        })
    })
};

const addRole = () => {
    connection.query(`SELECT * FROM department`, (err, res) => {
        if (err) throw err;
        let departments = res.map(department => ({ name: department.name, value: department.id }));
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
        ]).then((res) => {
            connection.query(`INSERT INTO role SET ?`,
                {
                    title: res.title,
                    salary: res.salary,
                    department_id: res.deptName,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n Successfully added to the database! \n`);
                    startApp();
                })
        })
    })

};

const updateRole = () => {
    connection.query(`SELECT * FROM role;`, (err, res) => {
        if (err) throw err;
        let roles = res.map(role => ({ name: role.title, value: role.id }));
        connection.query(`SELECT * FROM employee;`, (err, res) => {
            if (err) throw err;
            let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));
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
            ]).then((res) => {
                console.log(res)
                connection.query(`UPDATE employee SET role_id = ? WHERE id = ? ;`,
                    [
                        res.newRole,
                        res.employee,
                    ],
                    (err, res) => {
                        if (err) throw err;
                        console.log(`\n Successfully updated employee's role in the database! \n`);
                        startApp();
                    })
            })
        })
    })
};

const updateEmployeesManager = () => {
    connection.query(`SELECT * FROM employee;`, (err, res) => {
        if (err) throw err;
        let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));
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
        ]).then((res) => {
            connection.query(`UPDATE employee SET ? WHERE ?`,
                [
                    {
                        manager_id: res.newManager,
                    },
                    {
                        id: res.employee,
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

const removeDepartment = () => {
    connection.query(`SELECT * FROM department ORDER BY id ASC;`, (err, res) => {
        if (err) throw err;
        let departments = res.map(department => ({ name: department.department_name, value: department.id }));
        inquirer.prompt([
            {
                name: 'deptName',
                type: 'rawlist',
                message: 'Which department would you like to remove?',
                choices: departments
            },
        ]).then((res) => {
            connection.query(`DELETE FROM department WHERE ?`,
                [
                    {
                        id: res.deptName,
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

const removeRole = () => {
    connection.query(`SELECT * FROM role ORDER BY id ASC;`, (err, res) => {
        if (err) throw err;
        let roles = res.map(role => ({ name: role.title, value: role.id }));
        inquirer.prompt([
            {
                name: 'title',
                type: 'rawlist',
                message: 'Which role would you like to remove?',
                choices: roles
            },
        ]).then((res) => {
            connection.query(`DELETE FROM role WHERE ?`,
                [
                    {
                        id: res.title,
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

const removeEmployee = () => {
    connection.query(`SELECT * FROM employee ORDER BY id`, (err, res) => {
        if (err) throw err;
        let employees = res.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));
        inquirer.prompt([
            {
                name: 'employee',
                type: 'rawlist',
                message: 'Which employee would you like to remove?',
                choices: employees
            },
        ]).then((res) => {
            connection.query(`DELETE FROM employee WHERE ?`,
                [
                    {
                        id: res.employee,
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

const viewDepartmentSalary = () => {
    connection.query(`SELECT * FROM department ORDER BY id ASC;`, (err, res) => {
        if (err) throw err;
        let departments = res.map(department => ({ name: department.name, value: department.id }));
        inquirer.prompt([
            {
                name: 'deptName',
                type: 'rawlist',
                message: 'Which department would you like to view the total salaries of?',
                choices: departments
            },
        ]).then((res) => {
            connection.query(`SELECT department_id, SUM(role.salary) AS total_salary FROM role WHERE ?`,
                [
                    {
                        id: res.deptName,
                    },
                ],
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n The total utilized salary budget is below. \n`);
                    console.table('\n', res, '\n');
                    startApp();
                })
        })
    })
}

