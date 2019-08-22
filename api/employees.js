/*** 
Author: Robert Stofko
File: employees.js
Description: Setup CRUD operations for Employee table functionality.
*/

const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets.js');

// Returns a 200 response containing all saved currently-employed employees 
// (is_current_employee is equal to 1) on the employees property of the response body.

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
    (err, employees) => {
      if (err) {
        next(err);
      } else if (employees) {
        res.status(200).json({ employees: employees });
      } else {
        res.sendStatus(404);
      }
  });
});

// Creates a new employee with the information from the employee property of the 
// request body and saves it to the database. Returns a 201 response with the 
// newly-created employee on the employee property of the response body. If any 
// required fields are missing, returns a 400 response.

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage;
      
  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, position, wage)' +
      'VALUES ($name, $position, $wage)';
  const values = {
    $name: name,
    $position: position,
    $wage: wage
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (err, employee) => {
            res.status(201).json({ employee: employee });
        });
    }
  });
});

// Runs the query to find an employee with the given employee ID from the URL 
// parameter. If the returned query is false, sends a 404 error. If true, attaches
// returned employee to the req object and calls the next matching function.

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = { $employeeId: employeeId };
  db.get(sql, values, (err, employee) => {
    if (err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// Returns a 200 response containing the employee with the supplied employee ID 
// on the employee property of the response body. If an employee with the supplied 
// employee ID doesn’t exist, returns a 404 response.

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({ employee: req.employee });
});

// Updates the employee with the specified employee ID using the information 
// from the employee property of the request body and saves it to the database. 
// Returns a 200 response with the updated employee on the employee property of 
// the response body. If any required fields are missing, returns a 400 response.
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response.

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        employeeId = req.params.employeeId;
  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
      'wage = $wage ' +
      'WHERE Employee.id = $employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $employeeId: employeeId
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${employeeId}`,
      (err, employee) => {
        res.status(200).json({ employee: employee});
      });
    }
  });
});

// Updates the employee with the specified employee ID to be unemployed 
// (is_current_employee equal to 0). Returns a 200 response.
// If an employee with the supplied employee ID doesn’t exist, returns a 404 
// response.

employeesRouter.delete('/:employeeId', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const sql = 
  'UPDATE Employee SET is_current_employee = $is_current_employee WHERE Employee.id = $employeeId';
  const values = { 
    $is_current_employee: 0,
    $employeeId: employeeId 
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${employeeId}`,
      (err, employee) => {
        if (err) {
          next(err);
        } else if (!employee) {
          res.sendStatus(404); 
        } else { 
          res.status(200).json({ employee: employee });
        }
      });
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

module.exports = employeesRouter;