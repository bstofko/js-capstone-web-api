/*** 
Author: Robert Stofko
File: api.js
Description: Defines and sets up routing for the Employee and Menu routes.
*/

const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employees.js');
apiRouter.use('/employees', employeesRouter);

const menusRouter = require('./menus.js');
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;