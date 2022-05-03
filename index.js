"use strict";

const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');

// Connect to database
const db = mysql.createConnection(
	{
		host: 'localhost',
		user: 'root',
		password: 'foodfood',
		database: 'employeetracker_db'
	},
	console.log(`Connected to the employeetracker_db database.`)
).promise();

async function viewAllEmployees() {
	try {
		const employees = await db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary, department.name AS department, CONCAT(e.first_name, ' ', e.last_name) as manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee e ON employee.manager_id = e.id;`);
		console.table(employees[0]);
		await mainMenu();
	} catch (err) {
		console.log("viewAllRoles error: ", err);
	}
}

async function addEmployee() {
	try {
		// to do db get roles and add it as the choices in the list
		// const roles = await ;
		const roles = await db.query(`SELECT role.id, role.title FROM role`)[0];

		// to do db get managers and add it as the choices in the list
		const managers = await db.query(`SELECT employee.id, employee.first_name, employee.last_name FROM employee LEFT JOIN role ON employee.role_id = role.id  WHERE role.title CONTAINS "Lead Or Manager";`)[0];
		console.log(roles)
		console.log(managers);
		// managers.unshift("None");
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
				// to do: choices: roles
				choices: ["Sales Lead", "Sales Person", "Lead Engineer", "Software Engineer"]
			},
			{
				type: 'list',
				message: "Who is the employee's manager?",
				name: 'manager',
				// to do: choices: managers
				choices: ["Sales Lead", "Sales Person", "Lead Engineer", "Software Engineer"]
			}
		]);
		// to do: add employee to database
		// to do message: `Added ${employee.firstName} ${employee.lastName} to the database`;
		await mainMenu();
	} catch (err) {
		if (err.isTtyError) console.log("Prompt couldn't be rendered in the current environment");
		else throw err;
	}
}

async function updateEmployeeRole() {
	try {
		// to do db get employees and add it as the choices in the list
		// const employees = await ;

		// to do db get roles and add it as the choices in the list
		// const roles = await ;

		const updatedemployee = await inquirer.prompt([
			{
				type: 'list',
				message: "Which employee's role do you want to update?",
				name: 'name',
				// to do: choices: employees
				choices: ["Brian Bixby"]
			},
			{
				type: 'list',
				message: "Which role do you want to assign the selected employee?",
				name: 'role',
				// to do: choices: roles
				choices: ["Brian Bixby"]
			}
		]);
		// to do: update employee in database
		// to do message: `Updated employee's role`;
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
		console.log("viewAllRoles error: ", err);
	}
}

async function addRole() {
	try {
		// to do db get departments and add it as the choices in the list
		// const departments = await ;
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
				// to do: choices: departments
				choices: ["Sales", "Engineering", "Finance", "Legal"]
			}
		]);
		// to do: add role to database
		// to do message: `Added ${role.name} to the database`;
		await mainMenu();
	} catch (err) {
		if (err.isTtyError) console.log("Prompt couldn't be rendered in the current environment");
		else throw err;
	}
}

async function viewAllDepartments() {
	try {
		await mainMenu();
	} catch (err) {

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
		// to do: add message to database
		// to do message: `Added ${department.name} to the database`;
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