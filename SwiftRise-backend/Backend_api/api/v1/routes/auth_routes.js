const AppController = require("../controllers/AppController.js");
const { userRoutes } = require('./user_routes.js');
const { adminRoutes } = require('./admin_routes.js');
const { authenticate_admin } = require('../mws.js')
const express = require('express');

const authRoutes = express.Router();

/**
 * Binds the routes to the appropriate handler in the
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 * @author Eyang Daniel Eyoh <https://github.com/Tediyang>
 */

/**
 * Route to logout user
 * @swagger
 * paths:
 *   /logout:
 *      get:
 *        summary: Register a new user
 *        tags:
 *          - Authenticated Routes
 *        security:
 *          - token: []
 * 
 *      responses:
 *        '200':
 *          description: Logged out succesfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 */
authRoutes.get('/logout', AppController.logout);

// map user Routes
authRoutes.use('/user', userRoutes);

// map admin Routes
authRoutes.use('/admin', authenticate_admin);
authRoutes.use('/admin', adminRoutes);



module.exports = { authRoutes };
