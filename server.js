const mysql = require('mysql2');
const inquirer = require('inquirer');
require('console.table');

const promptMessage = {
    viewAllEmployees: "View All Employees",
    viewByDepartment: "View All Departments",
    viewByManager: "View All Employee by Manager",
    addEmployee: "Add An Employee",
    removeEmployee: "Remove An Employee",
    updateRole: "Update Employee Role",
    updateEmployeeManager: "Update Employee Manager",
    viewAllRoles: "View All Roles",
    quit: "Quit"
};

const connection = mysql.createConnection(
    {
        host: 'localhost',

        port: 3006,
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password here
        password: 'root',
        database: 'employeeTrack_db'
    },
    connection.connect(err => {
        if (err) throw err;
        prompt();
    }));

function prompt() {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            promptMessage.viewAllEmployees,
            promptMessage.viewByDepartment,
            promptMessage.viewByManager,
            promptMessage.viewAllRoles,
            promptMessage.addEmployee,
            promptMessage.removeEmployee,
            promptMessage.updateRole,
            promptMessage.quit
        ]
    })
        .then(answer => {
            console.log('answer', answer);
            switch (answer.action) {
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

function viewAllEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager on manager.id - employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW ALL EMPLOYEES');
        console.log('\n');
        console.table(res);
        prompt();
    })
}

function viewByDepartment() {
    const query = `SELECT department.name AS department, role.title, employee.id, employee.first_name, employee.last_name
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = roledepartment_id)
ORDER BY department.name;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY DEPARTMENT');
        console.log('\n');
        console.table(res);
        prompt();
    });
}

function viewByManager() {
    const query = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, department.name AS department, employee.id, employee.first_name, employee.last_name, role.title
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY manager;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY MANAGER');
        console.log('\n');
        console.table(res);
        prompt();
    });
}

function viewAllRoles() {
    const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department.name AS department
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = rolde.department_id)
    ORDER BY role.title;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY ROLE');
        console.log('\n');
        console.table(res);
        prompt();
    });
}

async function addEmployee() {
    const addName = await inquirer.prompt(askName());
    connection.query('SELECT role.id, role.title FROM role ORDEr BY role.id;', async (err, res) => {
        if (err) throw err;
        const { role } = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: () => res.map(res => res.title),
                message: 'What is the employee role?: '
            }
        ]);
        let roleID;
        for (const row of res) {
            if (row.title === role) {
                roleID = row.id;
                continue;
            }
        }
        connection.query('SELECT * FROM employee', async (err, res) => {
            if (err) throw err;
            let choices = res.map(res => `${res.first_name} ${res.last_name}`);
            choices.push('none');
            let { manager } = await inquirer.prompt([
                {
                    name: 'manager',
                    type: 'list',
                    choices: choices,
                    message: 'Choose the employee Manager: '
                }
            ]);
            let managerID;
            let managerName;
            if (manager === 'none') {
                managerID = null;
            } else {
                for (const data of res) {
                    data.fullName = `${data.first_name} ${data.last_name}`;
                    if (data.fullName === manager) {
                        managerID = data.id;
                        managerName = data.fullName;
                        console.log(managerID);
                        console.log(managerName);
                        continue;
                    }
                }
            }
            console.log('Employee has been added. Please view all employees to verify...');
            connection.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: addName.first,
                    last_name: addName.last,
                    role_id: roleID,
                    manager_id: parseInt(managerID)
                },
                (err, res) => {
                    if (err) throw err;
                    prompt();
                }
            );
        });
    });
}

function remove(input) {
    const promptConf = {
        yes: "Yes",
        no: "No"
    };
    inquirer.prompt([
        {
            name: "action",
            type: "list",
            message: "An ID must be entered inorder to proceed. Do you know the employee ID?",
            choices: [promptConf.yes, promptConf.no]
        }
    ]).then(answer => {
        if (input === 'delete' && answer.action === "yes") removeEmployee();
        else if (input === 'role' && answer.action === "yes") updateRole();
        else viewAllEmployees();
    });
};

async function removeEmployee(){
    const answer = await inquirer.prompt([
        {
        name: "first",
        type: "input",
        message: "Enter the employee ID you wish to remove: "
        }
    ]);

connection.query('DELETE FROM employee WHERE?',
{
    id: answer.first
},
function (err){
    if (err) throw err;
}
)
console.log('Employee has been removed.');
prompt();
};

function askID(){
    return([
        {
            name: "name",
            type: "input",
            message: "What is the employee ID?: "
        }
    ]);
};

async function updateRole(){
    const employeeID = await inquirer.prompy(askID());
    
    connection.query('SELECT role.id, role.title, FROM role, ORDER BY role.id;', async (err,res) => {
        if (err) throw err;
        const { role } = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: () => res.map(res => res.title),
                message: "What is the employee's new role?: "
            }
        ]);
        let roleID;
        for (const row of res){
            if (row.title === role) {
                roleID = row.id;
                continue;
            }
        }
        connection.query(`UPDATE employee SET role_id = ${roleID}
        WHERE employee.id = ${employeeID.name}`, async (err, res) => {
            if (err) throw err;
            console.log('Employee role has been updated.')
            prompt();
        });
    });
};

function askName(){
    return ([
        {
        name: "first",
        type: "input",
        message: "Enter employee's first name: "
        },
        {
            name: "last",
            type: "input",
            message: "Enter employee's last name:"
        }
    ]);
}