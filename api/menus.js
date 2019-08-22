/*** 
Author: Robert Stofko
File: menus.js
Description: Setup CRUD operations for Menu table functionality.
*/

const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter =require('./menuitems.js');

// Returns a 200 response containing all saved menus on the menus property of 
// the response body.

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menus: menus });
    }
  });
});

// Creates a new menu with the information from the menu property of the request 
// body and saves it to the database. Returns a 201 response with the newly-created 
// menu on the menu property of the response body.
// If any required fields are missing, returns a 400 response.

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {
    $title: title
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (err, menu) => {
          res.status(201).json({ menu: menu });
      });
    }
  });
});

// Runs the query to find an menu with the given menu ID from the URL parameter. 
// If the returned query is false, sends a 404 error. If true, attaches
// returned menu to the req object and calls the next matching function.

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = { $menuId: menuId };
  db.get(sql, values, (err, menu) => {
    if (err) {
      next(err);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// Returns a 200 response containing the menu with the supplied menu ID on the 
// menu property of the response body. If a menu with the supplied menu ID doesn’t 
// exist, returns a 404 response.

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({ menu: req.menu });
});

// Updates the menu with the specified menu ID using the information from the 
// menu property of the request body and saves it to the database. Returns a 200 
// response with the updated menu on the menu property of the response body.
// If any required fields are missing, returns a 400 response. If a menu with the 
// supplied menu ID doesn’t exist, returns a 404 response.

menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title,
        menuId = req.params.menuId;

  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: menuId
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${menuId}`,
        (err, menu) => {
          res.status(200).json({ menu: menu });
      });
    }
  });
});

// Deletes the menu with the supplied menu ID from the database if that menu has 
// no related menu items. Returns a 204 response. If the menu with the supplied 
// menu ID has related menu items, returns a 400 response. If a menu with the 
// supplied menu ID doesn’t exist, returns a 404 response.

menusRouter.delete('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const menuItemValues = { $menuId: menuId };
  
  db.get(menuItemSql, menuItemValues, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      res.sendStatus(400);
    } else {
      const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const values = { $menuId: menuId};
      db.run(sql, values, (err) => {
        if (err) {
          next(err);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

module.exports = menusRouter;