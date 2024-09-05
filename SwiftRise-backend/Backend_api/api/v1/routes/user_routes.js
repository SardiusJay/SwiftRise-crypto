const UserController = require('../controllers/UserController.js');
const express = require('express');

/**
 * Binds the routes to the appropriate handler in the
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 * @author Eyang Daniel Eyoh <https://github.com/Tediyang>
 */

// create router
const userRoutes = express.Router();

/**
 * Get user
 * @swagger
 * paths:
 *   /user/get/:id:
 *     get:
 *       summary: Get user by id
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: existing user id
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    user:
 *                      type: object
 *                      properties:
 *                        _id:
 *                           type: string
 *                           description: user id
 *                        role:
 *                           enum:
 *                             - USER
 *                             - ADMIN
 *                             - SUPER ADMIN
 *                        name:
 *                           type: string
 *                           description: combination of first name and last name
 *                        email:
 *                           type: string
 *                           description: user email
 *                        phone:
 *                           type: string
 *                           description: user phone number
 *                        dob:
 *                           type: date
 *                           description: User date of birth
 *          '400':
 *            description: Invalid request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Bad request, Invalid Credentials
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: User does not exist
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/get/:id', UserController.get_user);

/**
 * Update user
 * @swagger
 * paths:
 *  /user/update:
 *    post:
 *      summary: Update user data
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                fname:
 *                  type: string
 *                  description: First Name
 *                lname:
 *                  type: string
 *                  description: Last Name
 *                aka:
 *                  type: string
 *                  description: (Optional) Alias or Nickname
 *                dob:
 *                  type: string
 *                  format: YYYY-MM-DD
 *                sensitive:
 *                  type: object
 *                  description: Information here requires user password to update
 *                  properties:
 *                    email:
 *                      type: string
 *                      description: User's email address
 *                    phone:
 *                      type: string
 *                      description: User's phone number (pattern for validation can be added)
 *                      pattern: "/^[8792][01](esp)d{8}$/"  # For 10-digit phone numbers
 *                    new_password:
 *                      type: string
 *                      description: Capital, small, number and special character
 *                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/
 *                password:
 *                  type: string
 *                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/
 *                  description: This is required only when sensitive information wants to be updated.
 *
 *      responses:
 *        '201':
 *          description: User registration successful
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: User succesfully updated
 *                    user:
 *                      type: object
 *                      properties:
 *                        _id:
 *                           type: string
 *                           description: user id
 *                        role:
 *                           enum:
 *                             - USER
 *                             - ADMIN
 *                             - SUPER ADMIN
 *                        name:
 *                           type: string
 *                           description: combination of first name and last name
 *                        email:
 *                           type: string
 *                           description: user email
 *                        phone:
 *                           type: string
 *                           description: user phone number
 *                        dob:
 *                           type: date
 *                           description: User date of birth
 *        '400':
 *          description: Bad request (invalid data)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: No data provided
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: Minimum registration age is 14
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: Bad Request Invalid Credentials
 *                  - properties:
 *                      errors:
 *                        type: array
 *                        items:
 *                          type: string
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '404':
 *          description: File Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: User does not exist
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/update', UserController.update_user);

/**
 * Delete or deactivate account
 * @swagger
 * paths:
 *  /user/update:
 *    post:
 *      summary: Delete or deactivate account
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                want:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - DEACTIVATED
 *                    - DELETED
 *                  description: what the user wants to do 
 *                ans:
 *                  type: string
 *                  required: true
 *                  description: the answer to the secret question
 *                password:
 *                  type: string
 *                  required: true
 *                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/
 *
 *      responses:
 *        '200':
 *          description: User registration successful
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: User ${want} succesfully
 *        '400':
 *          description: Bad request (invalid data)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   msg:
 *                     type: string
 *                     description: password/ans incorrect
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '404':
 *          description: File Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: User does not exist
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/delete_or_deactivate', UserController.delete_or_deactivate_account);

/**
 * Fetch notifications
 * @swagger
 * paths:
 *  /user/notification/notifications:
 *    post:
 *      summary: fetch notifications
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                count:
 *                  type: boolean
 *                  default: false
 *                  description: if true it returns the number of notifications
 *                status:
 *                  type: string
 *                  enum:
 *                    - SENT
 *                    - RECEIVED
 *                    - READ
 *                  description: the status of the notification
 *
 *      responses:
 *        '200':
 *          description: User registration successful
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      notes:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            _id:
 *                              type: string
 *                            comment:
 *                              type: string
 *                            status:
 *                              type: string
 *                              enum:
 *                                - SENT
 *                                - RECEIVED
 *                                - READ
 *                            subject:
 *                              type: object
 *                              properties:
 *                                subject:
 *                                  type: string
 *                                  description: the subjetct id
 *                                doc_type:
 *                                  type: string
 *                                  enum:
 *                                    - User
 *                                    - Investment
 *                                    - Transaction
 *                                    - Payment
 *                                    - Contract
 *                  - properties:
 *                      count:
 *                        type: integer
 *        '400':
 *          description: Bad request (invalid data)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   msg:
 *                     type: string
 *                     description: Error Message
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '404':
 *          description: File Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: User does not exist
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/notification/notifications', UserController.get_notifications);

/**
 * get notification by id
 * @swagger
 * paths:
 *   /user/notification/:id:
 *     get:
 *       summary: Get notification by id
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: existing notification id
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    note:
 *                      type: object
 *                      properties:
 *                        _id:
 *                           type: string
 *                        comment:
 *                           type: string
 *                        status:
 *                           type: string
 *                           enum:
 *                             - SENT
 *                             - RECEIVED
 *                             - READ
 *                        subject:
 *                          type: object
 *                          properties:
 *                            subject:
 *                              type: string
 *                              description: the subjetct id
 *                            doc_type:
 *                              type: string
 *                              enum:
 *                                - User
 *                                - Investment
 *                                - Transaction
 *                                - Payment
 *                                - Contract
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  oneOf:
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Bad request, cant find jwt user
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Notification does not exist
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/notification/:id', UserController.get_notification);

/**
 * set a notification to read
 * @swagger
 * paths:
 *   /user/notification/read-notification/:id:
 *     get:
 *       summary: Set notification to read
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: existing notification id
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '201':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: object
 *                      description: Notifications update successful
 *          '400':
 *            description: Invalid request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Notification already read
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  oneOf:
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: User does not exist
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Notification does not exist
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/notification/read-notification/:id', UserController.read_notification);

/**
 * get wallet by id
 * @swagger
 * paths:
 *   /user/wallet/:id:
 *     get:
 *       summary: Get wallet by id
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: existing wallet id
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    wallet:
 *                      type: object
 *                      description: Notifications update successful
 *                      properties:
 *                         _id:
 *                           type: string
 *                         user:
 *                           type: string
 *                           description: user id
 *                         address:
 *                           type: string
 *                           description: the user blockchain address
 *                         coin:
 *                           type: string
 *                           enum:
 *                             - ETH
 *                             - BNB
 *                             - MATIC
 *                         investments:
 *                           type: array
 *                           description: Investments made by waller
 *                           items:
 *                             _id:
 *                               type: string
 *                         wallet_breakdown:
 *                           type: object
 *                           properties:
 *                             holdings:
 *                               type: number
 *                             total:
 *                               type: number
 *                             available:
 *                               type: number
 *          '400':
 *            description: Invalid request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Bad request, Invalid credentials
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                     msg:
 *                       type: string
 *                       description: Invalid Request, wallet does not exist
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/wallet/:id', UserController.get_wallet);

/**
 * get payment by id
 * @swagger
 * paths:
 *   /user/payment/:id:
 *     get:
 *       summary: Get payment by id
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: existing payment id
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    payment:
 *                      properties:
 *                         _id:
 *                           type: string
 *                           description: user id
 *                         user:
 *                           type: string
 *                           description: user id
 *                         wallet:
 *                           type: string
 *                           description: wallet id
 *                         miner:
 *                           type: string
 *                           description: name of miner which the investment was made
 *                         address:
 *                           type: string
 *                           description: the user blockchain address
 *                         coin:
 *                           type: string
 *                           enum:
 *                             - ETH
 *                             - BNB
 *                             - MATIC
 *                         investment:
 *                           type: string
 *                           description: Investment id
 *                         index:
 *                           type: integer
 *                           description: the payment index [between 0-7]
 *                         amount:
 *                           type: number
 *                           description: the amount to be paid to the wallet on due date
 *                         date:
 *                           type: date
 *                           description: the due date to resolve the payment
 *                         status:
 *                           type: string
 *                           description: the due date to resolve the payment
 *                           default: ON QUEUE
 *                         enum:
 *                           - PAID
 *                           - ON QUEUE
 *          '400':
 *            description: Invalid request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Bad request, Invalid credentials
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                     msg:
 *                       type: string
 *                       description: Invalid Request, payment does not exist
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/payment/:id', UserController.get_payment);

/**
 * get transaction by id
 * @swagger
 * paths:
 *   /user/transaction/:id:
 *     get:
 *       summary: Get transaction by id
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: existing transaction id
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    payment:
 *                      properties:
 *                        _id:
 *                          type: string
 *                        user:
 *                          type: string
 *                          description: user id
 *                        credit_wallet:
 *                          type: string
 *                          description: the wallet which was credited 
 *                        debit_wallet:
 *                          type: string
 *                          description: the wallet which was debited 
 *                        coin:
 *                          type: string
 *                          enum:
 *                            - ETH
 *                            - BNB
 *                            - MATIC
 *                        type:
 *                          type: string
 *                          enum:
 *                            - CREDIT
 *                            - DEBIT
 *                        transaction_breakdown:
 *                          type: object
 *                          properties:
 *                            amount:
 *                              type: number
 *                            charges:
 *                              type: number
 *                            total_amount:
 *                              type: number
 *                        status:
 *                          type: string
 *                          enum:
 *                            - SUCCESSFUL
 *                            - FAILED
 *                            - PENDING
 *                        data_from_payment_service:
 *                          type: string
 *                          description: the block chain transaction hash/id
 *          '400':
 *            description: Invalid request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Bad request, Invalid credentials
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                     msg:
 *                       type: string
 *                       description: Invalid Request, transaction does not exist
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/transaction/:id', UserController.get_transaction);

/**
 * get investment by id
 * @swagger
 * paths:
 *   /user/investment/:id:
 *     get:
 *       summary: Get investment by id
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: existing investment id
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    payment:
 *                      properties:
 *                        _id:
 *                          type: string
 *                        user:
 *                          type: string
 *                          description: user id
 *                        credit_wallet:
 *                          type: string
 *                          description: the wallet which was credited 
 *                        debit_wallet:
 *                          type: string
 *                          description: the wallet which was debited 
 *                        coin:
 *                          type: string
 *                          enum:
 *                            - ETH
 *                            - BNB
 *                            - MATIC
 *                        type:
 *                          type: string
 *                          enum:
 *                            - CREDIT
 *                            - DEBIT
 *                        transaction_breakdown:
 *                          type: object
 *                          properties:
 *                            amount:
 *                              type: number
 *                            charges:
 *                              type: number
 *                            total_amount:
 *                              type: number
 *                        status:
 *                          type: string
 *                          enum:
 *                            - SUCCESSFUL
 *                            - FAILED
 *                            - PENDING
 *                        data_from_payment_service:
 *                          type: string
 *                          description: the block chain transaction hash/id
 *          '400':
 *            description: Invalid request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Bad request, Invalid credentials
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                     msg:
 *                       type: string
 *                       description: Invalid Request, investment does not exist
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/investment/:id', UserController.get_investment);

/**
 * Get Investments
 * @swagger
 * paths:
 *  /user/get/investments:
 *    post:
 *      summary: get my investments
 *      tags:
 *        - User Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                count:
 *                  type: boolean
 *                  default: false
 *                  description: true to return count
 *                filter:
 *                  type: object
 *                  required: true
 *                  description: get users based on data, can also be left empty to fetch all investments
 *                  properties:
 *                     coin:
 *                       type: string
 *                       enum:
 *                         - ETH
 *                         - BNB
 *                         - MATIC
 *                     miner:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum:
 *                         - ACTIVE
 *                         - COMPLETED
 *                         - CANCELLED
 *                     createdAt:
 *                       type: object
 *                       properties:
 *                          range:
 *                            type: object
 *                            properties:
 *                               time_share:
 *                                 type: string
 *                                 default: hour
 *                                 description: get the last hour, day, week, month etc.
 *                                 enum:
 *                                   - hour
 *                                   - day
 *                                   - minute
 *                                   - week
 *                                   - month
 *                                   - year
 *                               times:
 *                                 type: number
 *                                 default: 1
 *                                 description: times will multiply the time_share to get the last number of hours, days etc. e.g 5 * hours wil get the last 5 hours.
 *                          exact_range:
 *                            type: array
 *                            description: provide two dates. One for start date and the other for end date. To get data from the same day. Provide start date and end date to be the same date.
 *                            items:
 *                              type: date
 *                              format: YYYY-MM-DD
 *                page:
 *                  type: integer
 *                  default: 1
 *                  description: pagination.
 *                size:
 *                  type: integer
 *                  default: 20
 *                  description: size of the data.
 *
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      investments:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            _id:
 *                              type: string
 *                            investor:
 *                              type: string
 *                              description: user id
 *                            wallet:
 *                              type: string
 *                              description: wallet id 
 *                            miner:
 *                              type: string
 *                              description: name of miner which the investment was made 
 *                            coin:
 *                              type: string
 *                              enum:
 *                                - ETH
 *                                - BNB
 *                                - MATIC
 *                            last_interest_payment_index:
 *                              type: integer
 *                              description: the last payment that was made
 *                            investment_breakdown:
 *                              type: object
 *                              properties:
 *                                capital:
 *                                  type: number
 *                                interest:
 *                                  type: number
 *                                total:
 *                                  type: number
 *                            maturity_date:
 *                              type: date
 *                              description: the day the last payment will be made
 *                            status:
 *                              type: string
 *                              enum:
 *                                - ACTIVE
 *                                - COMPLETED
 *                                - CANCELED
 *                            payments:
 *                              type: array
 *                              description: the payments that will be made on due dates
 *                              items:
 *                                _id:
 *                                  type: string
 *                      haveNextPage:
 *                        type: boolean
 *                      totalPages:
 *                        type: integer
 *                  - properties:
 *                      count:
 *                        type: integer
 *        '400':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errors:
 *                    type: string
 *                    description: Error message
 *        '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/get/investments', UserController.get_my_investments);

/**
 * Get Transactions
 * @swagger
 * paths:
 *  /user/get/transactions:
 *    post:
 *      summary: get transactions
 *      tags:
 *        - User Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                count:
 *                  type: boolean
 *                  default: false
 *                  description: true to return count
 *                filter:
 *                  type: object
 *                  required: true
 *                  description: get users based on data, can also be left empty to fetch all transactions
 *                  properties:
 *                     coin:
 *                       type: string
 *                       enum:
 *                         - ETH
 *                         - BNB
 *                         - MATIC
 *                     type:
 *                       type: string
 *                       enum:
 *                         - CREDIT
 *                         - DEBIT
 *                     status:
 *                       type: string
 *                       enum:
 *                         - SUCCESSFUL
 *                         - FAILED
 *                         - PENDING
 *                     credit_wallet:
 *                       type: string
 *                       description: the wallet that was credited
 *                     debit_wallet:
 *                       type: string
 *                       description: the wallet that was debited
 *                     createdAt:
 *                       type: object
 *                       properties:
 *                          range:
 *                            type: object
 *                            properties:
 *                               time_share:
 *                                 type: string
 *                                 default: hour
 *                                 description: get the last hour, day, week, month etc.
 *                                 enum:
 *                                   - hour
 *                                   - day
 *                                   - minute
 *                                   - week
 *                                   - month
 *                                   - year
 *                               times:
 *                                 type: number
 *                                 default: 1
 *                                 description: times will multiply the time_share to get the last number of hours, days etc. e.g 5 * hours wil get the last 5 hours.
 *                          exact_range:
 *                            type: array
 *                            description: provide two dates. One for start date and the other for end date. To get data from the same day. Provide start date and end date to be the same date.
 *                            items:
 *                              type: date
 *                              format: YYYY-MM-DD
 *                page:
 *                  type: integer
 *                  default: 1
 *                  description: pagination.
 *                size:
 *                  type: integer
 *                  default: 20
 *                  description: size of the data.
 *
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      transactions:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            _id:
 *                              type: string
 *                            user:
 *                              type: string
 *                              description: user id
 *                            credit_wallet:
 *                              type: string
 *                              description: the wallet which was credited 
 *                            debit_wallet:
 *                              type: string
 *                              description: the wallet which was debited 
 *                            coin:
 *                              type: string
 *                              enum:
 *                                - ETH
 *                                - BNB
 *                                - MATIC
 *                            type:
 *                              type: string
 *                              enum:
 *                                - CREDIT
 *                                - DEBIT
 *                            transaction_breakdown:
 *                              type: object
 *                              properties:
 *                                amount:
 *                                  type: number
 *                                charges:
 *                                  type: number
 *                                total_amount:
 *                                  type: number
 *                            status:
 *                              type: string
 *                              enum:
 *                                - SUCCESSFUL
 *                                - FAILED
 *                                - PENDING
 *                            data_from_payment_service:
 *                              type: string
 *                              description: the block chain transaction hash/id
 *                      haveNextPage:
 *                        type: boolean
 *                      totalPages:
 *                        type: integer
 *                  - properties:
 *                      count:
 *                        type: integer
 *        '400':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errors:
 *                    type: string
 *                    description: Error message
 *        '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/get/transactions', UserController.get_my_transactions);

/**
 * Get Wallets
 * @swagger
 * paths:
 *  /user/get/wallets:
 *    post:
 *      summary: get wallets
 *      tags:
 *        - User Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                all:
 *                  type: boolean
 *                  default: false
 *                  description: true to return all user wallets 
 *                coin:
 *                  type: string
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      wallets:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            _id:
 *                              type: string
 *                            user:
 *                              type: string
 *                              description: user id
 *                            address:
 *                              type: string
 *                              description: the user blockchain address
 *                            coin:
 *                              type: string
 *                              enum:
 *                                - ETH
 *                                - BNB
 *                                - MATIC
 *                            investments:
 *                              type: array
 *                              description: Investments made by waller
 *                              items:
 *                                _id:
 *                                  type: string
 *                            wallet_breakdown:
 *                              type: object
 *                              properties:
 *                                holdings:
 *                                  type: number
 *                                total:
 *                                  type: number
 *                                available:
 *                                  type: number
 *        '400':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errors:
 *                    type: string
 *                    description: Error message
 *        '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/get/wallets', UserController.get_my_wallets);

/**
 * Get Payments
 * @swagger
 * paths:
 *  /user/get/payments:
 *    post:
 *      summary: get payments
 *      tags:
 *        - User Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                count:
 *                  type: boolean
 *                  default: false
 *                  description: true to return count
 *                filter:
 *                  type: object
 *                  required: true
 *                  description: get users based on data, can also be left empty to fetch all payments
 *                  properties:
 *                     coin:
 *                       type: string
 *                       enum:
 *                         - ETH
 *                         - BNB
 *                         - MATIC
 *                     status:
 *                       type: string
 *                       enum:
 *                         - PAID
 *                         - ON QUEUE 
 *                     miner:
 *                       type: string
 *                       description: miner name
 *                     createdAt:
 *                       type: object
 *                       properties:
 *                          range:
 *                            type: object
 *                            properties:
 *                               time_share:
 *                                 type: string
 *                                 default: hour
 *                                 description: get the last hour, day, week, month etc.
 *                                 enum:
 *                                   - hour
 *                                   - day
 *                                   - minute
 *                                   - week
 *                                   - month
 *                                   - year
 *                               times:
 *                                 type: number
 *                                 default: 1
 *                                 description: times will multiply the time_share to get the last number of hours, days etc. e.g 5 * hours wil get the last 5 hours.
 *                          exact_range:
 *                            type: array
 *                            description: provide two dates. One for start date and the other for end date. To get data from the same day. Provide start date and end date to be the same date.
 *                            items:
 *                              type: date
 *                              format: YYYY-MM-DD
 *                page:
 *                  type: integer
 *                  default: 1
 *                  description: pagination.
 *                size:
 *                  type: integer
 *                  default: 20
 *                  description: size of the data.
 *
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      payments:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            _id:
 *                              type: string
 *                            user:
 *                              type: string
 *                              description: user id
 *                            wallet:
 *                              type: string
 *                              description: wallet id 
 *                            miner:
 *                              type: string
 *                              description: name of miner which the investment was made 
 *                            address:
 *                              type: string
 *                              description: the user blockchain address
 *                            coin:
 *                              type: string
 *                              enum:
 *                                - ETH
 *                                - BNB
 *                                - MATIC
 *                            investment:
 *                              type: string
 *                              description: Investment id
 *                            index:
 *                              type: integer
 *                              description: the payment index [between 0-7]
 *                            amount:
 *                              type: number
 *                              description: the amount to be paid to the wallet on due date
 *                            date:
 *                              type: date
 *                              description: the due date to resolve the payment
 *                            status:
 *                              type: string
 *                              description: the due date to resolve the payment
 *                              default: ON QUEUE
 *                              enum:
 *                                - PAID
 *                                - ON QUEUE
 *                      haveNextPage:
 *                        type: boolean
 *                      totalPages:
 *                        type: integer
 *                  - properties:
 *                      count:
 *                        type: integer
 *        '400':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errors:
 *                    type: string
 *                    description: Error message
 *        '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/get/payments', UserController.get_my_payments);

/**
 * Get miner by name
 * @swagger
 * paths:
 *   /user/get/miner/:name:
 *     get:
 *       summary: Get miner by name
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: name
 *           description: existing miner name
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    user:
 *                      type: object
 *                      properties:
 *                        _id:
 *                           type: string
 *                        name:
 *                           type: string
 *                        capitals:
 *                           type: array
 *                           items:
 *                             type: integer
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Miner not found
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/get/miner/:name', UserController.get_miner);

/**
 * Get miners
 * @swagger
 * paths:
 *   /user/miners:
 *     get:
 *       summary: Get miners
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    miners:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          _id:
 *                            type: string
 *                          name:
 *                            type: string
 *                          capitals:
 *                            type: array
 *                            items:
 *                              type: integer
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: no miner found
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/miners', UserController.get_all_miners);

/**
 * Create wallet
 * @swagger
 * paths:
 *  /user/create/wallet:
 *    post:
 *      summary: Create wallet
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                address:
 *                  type: string
 *                  required: true
 *                  description: wallet address
 *                coin:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: You have successfully created an ${coin} wallet
 *                  wallet:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                      user:
 *                        type: string
 *                        description: user id
 *                      address:
 *                        type: string
 *                        description: the user blockchain address
 *                      coin:
 *                        type: string
 *                      enum:
 *                        - ETH
 *                        - BNB
 *                        - MATIC
 *                      investments:
 *                        type: array
 *                        description: Investments made by waller
 *                        items:
 *                          _id:
 *                          type: string
 *                      wallet_breakdown:
 *                        type: object
 *                        properties:
 *                          holdings:
 *                            type: number
 *                          total:
 *                            type: number
 *                          available:
 *                            type: number
 *        '400':
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: Address already in use
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: User already have a ${coin} wallet
 *                  - properties:
 *                      errors:
 *                        type: array
 *                        items:
 *                          type: string
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/create/wallet', UserController.create_wallet);

/**
 * Update wallet
 * @swagger
 * paths:
 *  /user/update/wallet:
 *    post:
 *      summary: Update wallet
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                address:
 *                  type: string
 *                  description: wallet address
 *                coin:
 *                  type: string
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: You have successfully updated your ${coin} wallet address
 *                  wallet:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                      user:
 *                        type: string
 *                        description: user id
 *                      address:
 *                        type: string
 *                        description: the user blockchain address
 *                      coin:
 *                        type: string
 *                      enum:
 *                        - ETH
 *                        - BNB
 *                        - MATIC
 *                      investments:
 *                        type: array
 *                        description: Investments made by waller
 *                        items:
 *                          _id:
 *                          type: string
 *                      wallet_breakdown:
 *                        type: object
 *                        properties:
 *                          holdings:
 *                            type: number
 *                          total:
 *                            type: number
 *                          available:
 *                            type: number
 *        '400':
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: Address already in use
 *                  - properties:
 *                      errors:
 *                        type: array
 *                        items:
 *                          type: string
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '404':
 *          description: File Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: User does not have a ${coin} wallet
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/update/wallet', UserController.update_wallet);

/**
 * Invest
 * @swagger
 * paths:
 *  /user/invest:
 *    post:
 *      summary: Invest
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                miner_name:
 *                  type: string
 *                  required: true
 *                  description: miner name
 *                coin:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *                capital:
 *                  type: integer
 *                  description: money to invest
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: You have successfully invested ${capital} on ${miner_name}
 *                  investment:
 *                    type: string
 *        '400':
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: Insufficient funds
 *                  - properties:
 *                      errors:
 *                        type: array
 *                        items:
 *                          type: string
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '404':
 *          description: File Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: Bad Request Miner or coin wallet not found
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/invest', UserController.invest);

/**
 * Deposit
 * @swagger
 * paths:
 *  /user/deposit:
 *    post:
 *      summary: Deposit
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                address:
 *                  type: string
 *                  required: true
 *                  description: address which made the deposit
 *                coin:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *                amount:
 *                  type: number
 *                  required: true
 *                  description: deposit amount
 *                status:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - SUCCESSFUL
 *                    - FAILED
 *                    - PENDING
 *                transaction_id:
 *                  type: string
 *                  required: true
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: Transaction ${status}
 *                  transaction_id:
 *                    type: string
 *        '400':
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: Transaction failed
 *                  - properties:
 *                      errors:
 *                        type: array
 *                        items:
 *                          type: string
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '404':
 *          description: File Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: Bad Request Miner or coin wallet not found
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/deposit', UserController.deposit);

/**
 * Withdraw
 * @swagger
 * paths:
 *  /user/withdraw:
 *    post:
 *      summary: Withdraw
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                address:
 *                  type: string
 *                  required: true
 *                  description: address which made the deposit
 *                coin:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *                amount:
 *                  type: number
 *                  required: true
 *                  description: deposit amount
 *                answer:
 *                  type: string
 *                  required: true
 *                  description: answer to secret question
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: Transaction ${status}
 *                  transaction_id:
 *                    type: string
 *        '400':
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: Incorrect answer for security question "${user.q_and_a.question}?", try again
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: You dont have enough in ${coin} Wallet to withdraw
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: You cant withdraw less than $5
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: You cant withdraw more than $5,000
 *                  - properties:
 *                      errors:
 *                        type: array
 *                        items:
 *                          type: string
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '404':
 *          description: File Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: User does not exist
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: You dont have a ${coin} wallet
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/withdraw', UserController.withdraw);

/**
 * GetFundingPayload
 * @swagger
 * paths:
 *  /user/get/ABI:
 *    post:
 *      summary: GetFundingPayload
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                coin:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  contract:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                      address:
 *                        type: string
 *                        description: contract address
 *                      abi:
 *                        type: string
 *                        description: contract abi
 *        '400':
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '404':
 *          description: File Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: We dont have a ${coin} contract
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: You dont have a ${coin} wallet
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/get/ABI', UserController.getFundingPayload);

/**
 * resolve pending transaction
 * @swagger
 * paths:
 *   /user/resolve-pending-transaction/:id:
 *     get:
 *       summary: Resolve pendng transaction
 *       tags:
 *         - User Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: existing transaction id
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Transaction ${status}
 *                    transaction_id:
 *                      type: string
 *          '400':
 *            description: Invalid request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: Transaction already resolved. Status ${transaction.status}
 *          '401':
 *             content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: JWT Authentication e.g Token expiration
 *          '404':
 *            description: File Not Found
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  oneOf:
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: User have no transaction matching the provided id
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: User have no ${coin} wallet on our platform
 *          '500':
 *            description: Internal server error
 */
userRoutes.get('/resolve-pending-transaction/:id', UserController.resolveTransaction);

/**
 * Convert From Usd
 * @swagger
 * paths:
 *  /user/withdraw:
 *    post:
 *      summary: Convert From usd to Eth, BNB or Matic
 *      tags:
 *        - User Routes
 *      security:
 *         - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                coin:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *                amount:
 *                  type: number
 *                  required: true
 *                  description: deposit amount
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: Amount in ${coin}
 *                  data:
 *                    type: number
 *        '400':
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errors:
 *                    type: array
 *                    items:
 *                      type: string
 *        '401':
 *           content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: JWT Authentication e.g Token expiration
 *        '500':
 *          description: Internal server error
 */
userRoutes.post('/convertFromUsd', UserController.convertFromUsd);

module.exports = { userRoutes };
