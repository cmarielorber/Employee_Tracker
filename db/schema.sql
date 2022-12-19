DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL,
    INDEX deptIndex (department_id),
    CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) on DELETE CASCADE
);

CREATE TABLE employee (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 first_name VARCHAR(30) NOT NULL,
 last_name VARCHAR(30) NULL,
 role_id INT NOT NULL,
 INDEX roleIndex (role_id),
 manager_id INT NULL,
 INDEX manIndex (manager_id),
 CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL
);


use employees;
INSERT INTO department
    (name)
VALUES
    ('Engineering'),
    ('Finance'),
    ('Legal'),
    ('Sales');
INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 800000, 2),
    ('Lead Engineer', 150000, 3),
    ('Software Engineer', 1200000, 4),
    ('Account Manager', 160000, 5),
    ('Accountant', 125000, 6),
    ('Legal Team Lead', 250000, 7),
    ('Lawyer', 190000, 8),
INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Christen', 'Lorber', 1, NULL),
    ('Pesto', 'Pie', 2, 1),
    ('Sully', 'Sanchez', 3, 2),
    ('SeaEra', 'Bear', 4, NULL),
    ('Elli', 'Fratellis', 5, 4),
    ('LunaBug', 'Marie', 6, null),
    ('Cosmo', 'Kay', 7, 6),
    