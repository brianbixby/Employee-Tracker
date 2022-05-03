"use strict";

const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
	{
		host: 'localhost',
		user: 'root',
		password: 'foodfood',
		database: 'employeetracker_db'
	}
).promise();

async function viewAllEmployees() {
	try {
		const employees = await db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary, department.name AS department, CONCAT(e.first_name, ' ', e.last_name) as manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee e ON employee.manager_id = e.id;`);
		console.table(employees[0]);
		await mainMenu();
	} catch (err) {
		throw err;
	}
}

async function addEmployee() {
	try {
		const roles = await db.query(`SELECT role.id, role.title FROM role;`);
		// commented out code that filters by job title
		// const managers = await db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee LEFT JOIN role ON employee.role_id = role.id  WHERE role.title LIKE '%Lead%' OR  role.title LIKE '%Manager%';`);
		const managers = await db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee LEFT JOIN role ON employee.role_id = role.id;`);
		const titles = [], names = ["None"];
		roles[0].forEach(role => titles.push(role.title));
		managers[0].forEach(manager => names.push(manager.first_name + " " + manager.last_name));
		const employee = await inquirer.prompt([
			{
				name: "firstName",
				message: `What is the employee's first name?`,
				type: "input"
			},
			{
				name: "lastName",
				message: `What is the employee's last name?`,
				type: "input"
			},
			{
				type: 'list',
				message: "What is the employee's role?",
				name: 'role',
				choices: titles
			},
			{
				type: 'list',
				message: "Who is the employee's manager?",
				name: 'manager',
				choices: names
			}
		]);
		const chosenRole = roles[0].find(role => role.title === employee.role).id;
		const manager = employee.manager == "None" ? null : managers[0].find(manager => manager.first_name + " " + manager.last_name == employee.manager).id;
		await db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${employee.firstName}", "${employee.lastName}", ${chosenRole}, ${manager});`);
		console.log(`Added ${employee.firstName} ${employee.lastName} to the database`);
		await mainMenu();
	} catch (err) {
		if (err.isTtyError) console.log("Prompt couldn't be rendered in the current environment");
		else throw err;
	}
}

async function updateEmployeeRole() {
	try {
		const roles = await db.query(`SELECT role.id, role.title FROM role;`);
		const employees = await db.query(`SELECT employee.id, employee.first_name, employee.last_name FROM employee;`);
		const titles = [], employeeNames = [];
		roles[0].forEach(role => titles.push(role.title));
		employees[0].forEach(employee => employeeNames.push(employee.first_name + " " + employee.last_name));

		const updatedemployee = await inquirer.prompt([
			{
				type: 'list',
				message: "Which employee's role do you want to update?",
				name: 'name',
				choices: employeeNames
			},
			{
				type: 'list',
				message: "Which role do you want to assign the selected employee?",
				name: 'role',
				choices: titles
			}
		]);

		const roleId = roles[0].find(role => role.title === updatedemployee.role).id;
		const employeeId = employees[0].find(employee => employee.first_name + " " + employee.last_name == updatedemployee.name).id;
		await db.query(`UPDATE employee SET role_id = ${roleId} WHERE employee.id = "${employeeId}";`);
		console.log(`Updated employee's role`);
		await mainMenu();
	} catch (err) {
		if (err.isTtyError) console.log("Prompt couldn't be rendered in the current environment");
		else throw err;
	}
}

async function viewAllRoles() {
	try {
		const roles = await db.query(`SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id;`);
		console.table(roles[0]);
		await mainMenu();
	} catch (err) {
		throw err;
	}
}

async function addRole() {
	try {
		const departments = await db.query(`SELECT * FROM department;`);
		const departmentNames = [];
		departments[0].forEach(department => departmentNames.push(department.name));
		const role = await inquirer.prompt([
			{
				name: "name",
				message: `What is the name of the role?`,
				type: "input"
			},
			{
				name: "salary",
				message: `What is the salary of the role?`,
				type: "input"
			},
			{
				type: 'list',
				message: 'Which department does the role belong to?',
				name: 'department',
				choices: departmentNames
			}
		]);
		const departmentId = departments[0].find(department => department.name === role.department).id;
		await db.query(`INSERT INTO role (title, department_id, salary) VALUES ("${role.name}", ${departmentId}, ${role.salary});`);
		console.log(`Added ${role.name} to the database`);
		await mainMenu();
	} catch (err) {
		if (err.isTtyError) console.log("Prompt couldn't be rendered in the current environment");
		else throw err;
	}
}

async function viewAllDepartments() {
	try {
		const departments = await db.query(`SELECT * FROM department;`);
		console.table(departments[0]);
		await mainMenu();
	} catch (err) {
		throw err;
	}
}

async function addDepartment() {
	try {
		const department = await inquirer.prompt([
			{
				name: "name",
				message: `What is the name of the department?`,
				type: "input"
			}
		]);
		await db.query(`INSERT INTO department (name) VALUES ("${department.name}");`);
		console.log(`Added ${department.name} to the database`);
		await mainMenu();
	} catch (err) {
		if (err.isTtyError) console.log("Prompt couldn't be rendered in the current environment");
		else throw err;
	}
}

async function mainMenu() {
	try {
		const mainMenuAnswer = await inquirer.prompt([
			{
				type: 'list',
				message: 'What would you like to do?',
				name: 'action',
				choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Quit"]
			}
		]);
		switch (mainMenuAnswer.action) {
			case "View All Employees":
				await viewAllEmployees();
				break;
			case "Add Employee":
				await addEmployee()
				break;
			case "Update Employee Role":
				await updateEmployeeRole()
				break;
			case "View All Roles":
				await viewAllRoles();
				break;
			case "Add Role":
				await addRole();
				break;
			case "View All Departments":
				await viewAllDepartments();
				break;
			case "Add Department":
				await addDepartment();
				break;
			case "Quit":
				break;
			default:
				break;
		}
	} catch (err) {
		if (err.isTtyError) console.log("Prompt couldn't be rendered in the current environment");
		else throw err;
	}
}

mainMenu();