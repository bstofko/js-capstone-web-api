/*** 
Author: Robert Stofko
File: timesheets.js
Description: Setup CRUD operations for Timesheet table functionality.
*/

const express = require('express');
const timesheetsRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Returns a 200 response containing all saved timesheets related to the 
// employee with the supplied employee ID on the timesheets property of the 
// response body. If an employee with the supplied employee ID doesn’t exist, 
// returns a 404 response.

timesheetsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE employee_id = $employeeId';
  const values = { $employeeId: req.params.employeeId};
  
  db.all(sql, values, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ timesheets: timesheets });
    }
  });
});

// Creates a new timesheet, related to the employee with the supplied employee ID, 
// with the information from the timesheet property of the request body and saves 
// it to the database. Returns a 201 response with the newly-created timesheet on 
// the timesheet property of the response body. If an employee with the supplied 
// employee ID doesn’t exist, returns a 404 response.

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;
  
  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
    'VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
        (err, timesheet) => {
            res.status(201).json({ timesheet: timesheet });
        });
    }
  });
});

// Runs the query to find an timesheet with the given timesheet ID from the URL 
// parameter. If the returned query is false, sends a 404 error. If true, attaches
// returned timesheet to the req object and calls the next matching function.

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = { $timesheetId: timesheetId };

  db.get(sql, values, (err, timesheet) => {
    if (err) {
      next(err);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// Updates the timesheet with the specified timesheet ID using the information 
// from the timesheet property of the request body and saves it to the database. 
// Returns a 200 response with the updated timesheet on the timesheet property of 
// the response body.
// If any required fields are missing, returns a 400 response.
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response.
// If an timesheet with the supplied timesheet ID doesn’t exist, returns a 404 response.

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        timesheetId = req.params.timesheetId,
        employeeId = req.params.employeeId;

  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, ' +
    'date = $date, employee_id = $employeeId ' + 'WHERE Timesheet.id = $timesheetId';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId,
    $timesheetId: timesheetId
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${timesheetId}`,
        (err, timesheet) => {
          res.status(200).json({ timesheet: timesheet });    
      });
    }
  });
});

// Deletes the timesheet with the supplied timesheet ID from the database. 
// Returns a 204 response.
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response.
// If an timesheet with the supplied timesheet ID doesn’t exist, returns a 404 response.

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const employeeId = req.params.employeeId,
        timesheetId = req.params.timesheetId;
        
  const sql = 'DELETE FROM Timesheet WHERE id = $timesheetId';
  const values = { $timesheetId: timesheetId };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;