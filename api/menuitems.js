/*** 
Author: Robert Stofko
File: menuitems.js
Description: Setup CRUD operations for MenuItem table functionality.
*/

const express = require('express');
const menuItemsRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Returns a 200 response containing all saved menu items related to the menu with 
// the supplied menu ID on the menuItems property of the response body.
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response.

menuItemsRouter.get('/', (req, res, next) => {
  const menuId = req.params.menuId;
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const values = { $menuId: menuId };

  db.all(sql, values, (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menuItems: menuItems });
    }
  });
});

// Creates a new menu item, related to the menu with the supplied menu ID, with 
// the information from the menuItem property of the request body and saves it to 
// the database. Returns a 201 response with the newly-created menu item on the 
// menuItem property of the response body.
// If any required fields are missing, returns a 400 response.
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response.

menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
        menuId = req.params.menuId;

  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_Id)' +
              'VALUES ($name, $description, $inventory, $price, $menuId)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        (err, menuItem) => {
          res.status(201).json({ menuItem: menuItem});        
      });
    }
  });
});

// Runs the query to find an menuItem with the given menuItemID from the URL parameter. 
// If the returned query is false, sends a 404 error. If true, attaches
// returned menuItem to the req object and calls the next matching function.

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = { $menuItemId: menuItemId };

  db.get(sql, values, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// Updates the menu item with the specified menu item ID using the information 
// from the menuItem property of the request body and saves it to the database. 
// Returns a 200 response with the updated menu item on the menuItem property of 
// the response body.
// If any required fields are missing, returns a 400 response.
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response.
// If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response.

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
        menuItemId = req.params.menuItemId;

  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }
  
  const sql = 'UPDATE MenuItem SET name = $name, description = $description, ' +
    'inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuItemId: menuItemId
  };

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${menuItemId}`,
        (err, menuItem) => {
          res.status(200).json({ menuItem: menuItem });     
      });
    }
  });
});

// Deletes the menu item with the supplied menu item ID from the database. 
// Returns a 204 response.
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response.
// If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response.

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = { $menuItemId: menuItemId};
  
  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;