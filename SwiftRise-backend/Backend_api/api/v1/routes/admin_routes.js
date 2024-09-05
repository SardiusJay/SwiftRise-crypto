const AdminController = require('../controllers/AdminController.js');
const { authenticate_super_admin } = require('../mws.js')
const express = require('express');

/**
 * Defines the routes particular to admins only
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 * @author Eyang, Daniel Eyoh <https://github.com/Tediyang>
 */

// creates router   
const adminRoutes = express.Router();

/**
 * Switch user role
 * @swagger
 * paths:
 *  /admin/role/switcheroo:
 *    post:
 *      summary: switch user role
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  required: true
 *                  description: First Name
 *                role:
 *                  enum:
 *                    - USER
 *                    - ADMIN
 *                    - SUPER ADMIN
 *                  required: true
 * 
 *      responses:
 *        '200':
 *          description: User has the role already.
 *        '201':
 *          description: Role succesfully updated.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                  user:
 *                    type: object
 *                    properties:
 *                       _id:
 *                         type: string
 *                         description: user id
 *                       status:
 *                         enum:
 *                           - ACTIVE
 *                           - DEACTIVATED
 *                           - DISABLED
 *                           - DELETED
 *                       gender:
 *                         enum:
 *                           - MALE
 *                           - FEMALE
 *                       role:
 *                         enum:
 *                           - USER
 *                           - ADMIN
 *                           - SUPER ADMIN
 *                       name:
 *                         type: string
 *                         description: combination of first name and last name
 *                       email:
 *                         type: string
 *                         description: user email
 *                       phone:
 *                         type: string
 *                         description: user phone number
 *                       dob:
 *                         type: date
 *                         description: User date of birth
 *        '400':
 *          description: Bad request (invalid data)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
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
 *        '404':
 *          description: User does not exist
 *        '500':
 *          description: Internal server error
 */
adminRoutes.post('/role/switcheroo', authenticate_super_admin, AdminController.role_switcheroo);

/**
 * Find User
 * @swagger
 * paths:
 *  /admin/find/user:
 *    post:
 *      summary: find user using email and phone
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        description: either email or phone is required
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  description: User email
 *                phone:
 *                  type: string
 *                  description: User phone number
 * 
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    type: object
 *                    properties:
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
 *                        status:
 *                          enum:
 *                            - ACTIVE
 *                            - DEACTIVATED
 *                            - DISABLED
 *                            - DELETED
 *                        gender:
 *                          enum:
 *                            - MALE
 *                            - FEMALE
 *        '400':
 *          description: Invalid request, email or phone required
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
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
 *        '404':
 *          description: User not found
 *        '500':
 *          description: Internal server error
 */
adminRoutes.post('/find/user', AdminController.find_user);

/**
 * Search User
 * @swagger
 * paths:
 *  /admin/search/user:
 *    post:
 *      summary: find user(s) using search query
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        description: searches through all the user params e.g name, dob, gender etc.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                search:
 *                  type: string
 *                  description: query
 *                  required: true
 * 
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  users:
 *                    type: array
 *                    items:
 *                       type: object
 *                       description: returns users
 *                       properties:
 *                          _id:
 *                            type: string
 *                            description: user id
 *                          role:
 *                            enum:
 *                              - USER
 *                              - ADMIN
 *                              - SUPER ADMIN
 *                          name:
 *                             type: string
 *                             description: combination of first name and last name
 *                          email:
 *                             type: string
 *                             description: user email
 *                          phone:
 *                             type: string
 *                             description: user phone number
 *                          dob:
 *                             type: date
 *                             description: User date of birth
 *                          status:
 *                            enum:
 *                              - ACTIVE
 *                              - DEACTIVATED
 *                              - DISABLED
 *                              - DELETED
 *                          gender:
 *                            enum:
 *                              - MALE
 *                              - FEMALE
 *        '400':
 *          description: Invalid request, search is required
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
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
adminRoutes.post('/search/user', AdminController.search_user);

/**
 * Get Users
 * @swagger
 * paths:
 *  /admin/get/users:
 *    post:
 *      summary: get users
 *      tags:
 *        - Admin Routes
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
 *                  description: get users based on data, can also be left empty to fetch all users
 *                  properties:
 *                     name:
 *                       type: object
 *                       properties:
 *                          fname:
 *                            type: string
 *                          lname:
 *                            type: string
 *                          aka:
 *                            type: string
 *                     dob:
 *                       type: date
 *                       format: YYYY-MM-DD
 *                     role:
 *                       type: string
 *                       enum:
 *                         - USER
 *                         - ADMIN
 *                         - SUPER ADMIN
 *                     status:
 *                       type: string
 *                       enum:
 *                         - ACTIVE
 *                         - DEACTIVATED
 *                         - DISABLED
 *                         - DELETED
 *                     gender:
 *                       type: string
 *                       enum:
 *                         - MALE
 *                         - FEMALE
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
 *                      users:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            _id:
 *                              type: string
 *                              description: user id
 *                            role:
 *                              enum:
 *                                - USER
 *                                - ADMIN
 *                                - SUPER ADMIN
 *                            name:
 *                              type: string
 *                              description: combination of first name and last name
 *                            email:
 *                              type: string
 *                              description: user email
 *                            phone:
 *                              type: string
 *                              description: user phone number
 *                            dob:
 *                              type: date
 *                              description: User date of birth
 *                            status:
 *                              enum:
 *                                - ACTIVE
 *                                - DEACTIVATED
 *                                - DISABLED
 *                                - DELETED
 *                            gender:
 *                              enum:
 *                                - MALE
 *                                - FEMALE
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
adminRoutes.post('/get/users', AdminController.get_users);

/**
 * Get Investments
 * @swagger
 * paths:
 *  /admin/get/investments:
 *    post:
 *      summary: get investments
 *      tags:
 *        - Admin Routes
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
 *                     investor:
 *                       type: string
 *                       description: user id
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
 *                     wallet:
 *                       type: string
 *                       description: wallet id not wallet address
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
adminRoutes.post('/get/investments', AdminController.get_investments);

/**
 * Get Transactions
 * @swagger
 * paths:
 *  /admin/get/transactions:
 *    post:
 *      summary: get transactions
 *      tags:
 *        - Admin Routes
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
 *                     user:
 *                       type: string
 *                       description: user id
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
 *                              description: user id
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
adminRoutes.post('/get/transactions', AdminController.get_transactions);

/**
 * Get Wallets
 * @swagger
 * paths:
 *  /admin/get/wallets:
 *    post:
 *      summary: get wallets
 *      tags:
 *        - Admin Routes
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
 *                  description: get users based on data, can also be left empty to fetch all wallets
 *                  properties:
 *                     user:
 *                       type: string
 *                       description: user id
 *                     coin:
 *                       type: string
 *                       enum:
 *                         - ETH
 *                         - BNB
 *                         - MATIC
 *                     address:
 *                       type: string
 *                       description: the wallet address
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
adminRoutes.post('/get/wallets', AdminController.get_wallets);

/**
 * Get Payments
 * @swagger
 * paths:
 *  /admin/get/payments:
 *    post:
 *      summary: get payments
 *      tags:
 *        - Admin Routes
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
 *                     user:
 *                       type: string
 *                       description: user id
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
 *                              description: user id
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
adminRoutes.post('/get/payments', AdminController.get_payments);

/**
 * Disable User
 * @swagger
 * paths:
 *  /disable/user:
 *    post:
 *      summary: disable user
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                password:
 *                  type: string
 *                  required: true
 *                  description: the logged in admin password
 *                user_id:
 *                  type: string
 *                  required: true
 *                reason:
 *                  type: string
 *                  required: true
 *                  description: the reason why the user account was disabled.
 *
 *      responses:
 *         '200':
 *           description: Login successful
 *           content:
 *             application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: User disabled successfully
 *         '400':
 *           description: Invalid Request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 oneOf:
 *                   - properties:
 *                       msg:
 *                         type: string
 *                         description: user already disabled
 *                   - properties:
 *                       msg:
 *                         type: string
 *                         description: incorrect password
 *         '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *         '404':
 *           description: Invalid Request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                     description: user does not exist
 *         '500':
 *           description: Internal server error
 */
adminRoutes.post('/disable/user', AdminController.disable_account);

/**
 * Get Contract(s)
 * @swagger
 * paths:
 *  /admin/get-contract:
 *    post:
 *      summary: get contract(s)
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                coin:
 *                  type: string
 *                  deafult: ETH
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *                all:
 *                  type: boolean
 *                  default: false
 *                  description: return all contract if set to true
 *
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      contracts:
 *                        type: array
 *                        items:
 *                          type: object
 *                          description: return contracts
 *                          properties:
 *                            _id:
 *                              type: string
 *                            address:
 *                              type: string
 *                              description: contract address
 *                            abi:
 *                              type: string
 *                              description: contract abi
 *                  - properties:
 *                      contract:
 *                        type: object
 *                        description: return one contract
 *                        properties:
 *                          _id:
 *                            type: string
 *                          address:
 *                            type: string
 *                            description: contract address
 *                          abi:
 *                            type: string
 *                            description: contract abi
 *        '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *        '404':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: We have no contracts
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: We dont have a $[coin} contract
 *        '500':
 *          description: Internal server error
 */
adminRoutes.post('/get-contract', AdminController.getContract);

/**
 * Settle Funding Dispute(s)
 * @swagger
 * paths:
 *  /admin/settle/fund/dispute:
 *    post:
 *      summary: Settle Funding Dispute
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  required: true
 *                coin:
 *                  type: string
 *                  required: true
 *                  enum:
 *                    - ETH
 *                    - BNB
 *                    - MATIC
 *                address:
 *                  type: string
 *                  required: true
 *                event:
 *                  type: integer
 *                  default: 0
 *                  description: 0 meaning the most recent transaction made by the user. 1 means the transaction that follows the recent and so on.
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   msg:
 *                     type: string
 *                     description: Transaction status
 *                   transactionId:
 *                     type: string
 *                     description: Transaction id
 *        '400':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: user does not have such transaction on ${coin} blockchain
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: Transaction has already been settled
 *        '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *        '404':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                oneOf:
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: User with Email ${email} does not exist
 *                  - properties:
 *                      msg:
 *                        type: string
 *                        description: User have no {coin} wallet on our platform
 *        '500':
 *          description: Internal server error
 */
adminRoutes.post('/settle/fund/dispute', AdminController.settleFundingDispute);

/**
 * Settle Withdrawal Dispute(s)
 * @swagger
 * paths:
 *  /admin/settle/app/withdraw/dispute:
 *    post:
 *      summary: Settle Withdrawal Dispute
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
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
 *                event:
 *                  type: integer
 *                  default: 0
 *                  description: 0 meaning the most recent transaction made by the user. 1 means the transaction that follows the recent and so on.
 *
 *      responses:
 *        '201':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   msg:
 *                     type: string
 *                     description: Transaction status
 *                   transactionId:
 *                     type: string
 *                     description: Transaction id
 *        '400':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: Transaction has already been settled
 *        '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *        '404':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   msg:
 *                     type: string
 *                     description: No such transaction exists on the blockchain
 *        '500':
 *          description: Internal server error
 */
adminRoutes.post('/settle/app/withdraw/dispute', authenticate_super_admin, AdminController.settleAppWithdrawDispute);

/**
 * Update contract
 * @swagger
 * paths:
 *  /admin/update-contract:
 *    post:
 *      summary: Update Contract
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
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
 *                address:
 *                  type: string
 *                  required: true
 *                abi:
 *                  type: string
 *                  description: contract abi in text or json.
 *
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   msg:
 *                     type: string
 *                     description: ${coin} Contract updated successfully
 *        '401':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: JWT Authentication e.g Token expiration
 *        '404':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: We dont have a ${coin} contract
 *        '500':
 *          description: Internal server error
 */
adminRoutes.post('/update-contract', authenticate_super_admin, AdminController.updateContract);

/**
 * App withdraw
 * @swagger
 * paths:
 *   /admin/app/withdraw/:coin:
 *     get:
 *       summary: Withdraw from Contracts
 *       tags:
 *         - Admin Routes
 *       security:
 *         - token: []
 *       parameters:
 *         - in: path
 *           name: coin
 *           description: either ETH, BNB or MATIC
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '201':
 *            description:  Status of the transaction
 *            content:
 *              application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                       description: Transaction status
 *                     transaction_id:
 *                       type: string
 *          '400':
 *            description: Invalid request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  oneOf:
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Invalid coin
 *                    - properties:
 *                        errors:
 *                          type: string
 *                          description: Error Message
 *          '500':
 *            description: Internal server error
 */
adminRoutes.get('/app/withdraw/:coin', authenticate_super_admin, AdminController.appWithdraw);

/**
 * Register miner
 * @swagger
 * paths:
 *  /admin/miner/register:
 *    post:
 *      summary: Register miner
 *      tags:
 *        - Admin Routes
 *      security:
 *        - token: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  required: true
 *                capital:
 *                  type: array
 *                  description: the amount required by the miner to invest.
 *
 *      responses:
 *        '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   msg:
 *                     type: string
 *                     description: ${name} Miner registered successfully
 *                   name:
 *                     type: string
 *                     description: Miner name
 *        '400':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    description: Error Message
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
adminRoutes.post('/miner/register', authenticate_super_admin, AdminController.register_miner);


module.exports = { adminRoutes };
