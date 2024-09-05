const AppController = require("../controllers/AppController.js");
const express = require('express');

const generalRoutes = express.Router();

/**
 * Binds the routes to the appropriate handler in the
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 * @author Eyang Daniel Eyoh <https://github.com/Tediyang>
 */

generalRoutes.get('/', AppController.home);

/**
 * Route to register user
 * @swagger
 * paths:
 *  /register:
 *    post:
 *      summary: Register a new user
 *      tags:
 *        - Account Routes
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                fname:
 *                  type: string
 *                  required: true
 *                  description: First Name
 *                lname:
 *                  type: string
 *                  required: true
 *                  description: Last Name
 *                aka:
 *                  type: string
 *                  description: (Optional) Alias or Nickname
 *                email:
 *                  type: string
 *                  required: true
 *                  description: User's email address
 *                  format: email  # Ensures valid email format
 *                password:
 *                  type: string
 *                  required: true
 *                  description: Capital, small, number and special character
 *                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/
 *                gender:
 *                  type: string
 *                  enum:
 *                    - MALE
 *                    - FEMALE
 *                  required: true
 *                  description: User's gender
 *                phone:
 *                  type: string
 *                  required: true
 *                  description: User's phone number (pattern for validation can be added)
 *                  pattern: "/^[8792][01](esp)d{8}$/"  # For 10-digit phone numbers
 *                dob:
 *                  type: string
 *                  required: true
 *                  format: YYYY-MM-DD
 *                q_and_a:
 *                  type: object
 *                  required: true
 *                  description: Security question and answer
 *                  properties:
 *                    question:
 *                      type: string
 *                      required: true
 *                    answer:
 *                      type: string
 *                      required: true

 *      responses:
 *        '201':
 *          description: User registration successful
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    description: Registered user's email
 *                  phone:
 *                    type: string
 *                    description: Registered user's phone number
 *                  status:
 *                    type: string
 *                    description: Registration status (e.g., "success")
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
 *                        description: You are underage, go and play
 *                  - properties:
 *                      errors:
 *                        type: array
 *                        items:
 *                          type: string
 *        '500':
 *          description: Internal server error
 */
generalRoutes.post('/register', AppController.register_user);

/**
 * Route to log in a user
 * @swagger
 * paths:
 *  /login:
 *    post:
 *      summary: Log in a user
 *      tags:
 *        - Account Routes
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email_or_phone:
 *                  type: string
 *                  required: true
 *                password:
 *                  type: string
 *                  required: true
 * 
 *      responses:
 *         '201':
 *           description: Login successful
 *           content:
 *             application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    msg:
 *                      type: string
 *                      description: success message
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
 *                        token:
 *                           type: object
 *                           properties:
 *                              accessToken:
 *                                type: string
 *                              refreshToken:
 *                                type: string
 * 
 *         '400':
 *           description: Bad request (invalid data)
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 oneOf:
 *                   - properties:
 *                       msg:
 *                         type: string
 *                         description: email/phone or password or answer incorrect
 *                   - properties:
 *                       msg:
 *                         type: string
 *                         description: email/phone or password incorrect
 *                   - properties:
 *                       msg:
 *                         type: string
 *                         description: Account ${status} - DEACTIVATED, DISABLED or DELETED
 *                       resolve:
 *                         description: false if account can't be resolved or returns resolve url
 *                         oneOf:
 *                           - type: string
 *                           - type: boolean
 *                   - properties:
 *                       errors:
 *                         type: array
 *                         items:
 *                           type: string
 *         '500':
 *           description: Internal server error
 */
generalRoutes.post('/login', AppController.login);

/**
 * Get new accessToken using refreshToken
 * @swagger
 * paths:
 *   /refreshToken:
 *     post:
 *       summary: Get new accessToken
 *       tags:
 *         - General Routes
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 refreshToken:
 *                   type: string
 *                   required: true
 *                   description: user refreshToken
 *                 user_id:
 *                   type: string
 *                   required: true
 *                   description: user data id
 *
 *       responses:
 *          '200':
 *            description: Token refresh successful
 *            content:
 *              application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                       description: success message
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                            type: string
 *                            description: user id
 *                     new_token: 
 *                       type: string
 * 
 *          '400':
 *            description: Invalid request body | Invalid Credential, Refresh token invalid
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  oneOf:
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Invalid Credential, Refresh token invalid
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Invalid request body
 *                        errors:
 *                          type: array
 *                          items:
 *                            type: string
 * 
 *          '401':
 *            description: Refresh Token expired, user should login again
 *
 *          '404':
 *            description: User does not exist
 *
 *          '500':
 *            description: Internal server error
 */
generalRoutes.post('/refresh-token', AppController.refreshToken);

/**
 * Forget password route
 * @swagger
 * paths:
 *   /forget-password:
 *     post:
 *       summary: allow user to setup a new password
 *       tags:
 *         - General Routes
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   required: true
 *                   description: user email linked to profile
 *                 front_url:
 *                   type: string
 *                   required: true
 *                   description: frontend url to forget password page
 * 
 *       responses:
 *          '201':
 *            description: password reset link sent successfully
 *            content:
 *              application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                       description: success message
 *
 *          '400':
 *            description: Invalid request body
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    error:
 *                      type: string
 *                      description: Error message
 *                    errors:
 *                      type: array
 *                      items:
 *                        type: string
 *
 *          '404':
 *            description: Email does not exist
 *
 *          '500':
 *            description: Internal server error
 */
generalRoutes.post('/forget-password', AppController.forget_pwd);

/**
 * Validate reset password token
 * @swagger
 * paths:
 *   /forget-password/validate-token/:token:
 *     get:
 *       summary: valid reset then send from url param
 *       tags:
 *         - General Routes
 *       parameters:
 *         - in: path
 *           name: token
 *           required: true
 *           schema:
 *             type: string
 * 
 *       responses:
 *          '200':
 *            description: Token is valid
 *            content:
 *              application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                       description: success message
 *                     valid:
 *                       type: boolean
 *                       description: true if token is valid or false if token is invalid
 *                     token:
 *                        type: string
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
 *                          description: token is required
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: token is blacklisted
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: token has expired
 *          '500':
 *            description: Internal server error
 */
generalRoutes.get('/forget-password/validate-token/:token', AppController.validate_reset_pwd_token);

/**
 * Forget password route
 * @swagger
 * paths:
 *   /forget-password/update:
 *     post:
 *       summary: allow user to setup a new password
 *       tags:
 *         - General Routes
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   required: true
 *                   description: user email linked to profile
 *                 front_url:
 *                   type: string
 *                   required: true
 *                   description: frontend url to forget password page
 * 
 *       responses:
 *          '201':
 *            description: password reset link sent successfully
 *            content:
 *              application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                       description: success message
 *
 *          '400':
 *            description: Invalid request body
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  oneOf:
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Invalid request, token is blacklisted
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Invalid request, token expired
 *                    - properties:
 *                        msg:
 *                          type: string
 *                          description: Invalid request body
 *                        errors:
 *                          type: array
 *                          items:
 *                            type: string
 *
 *          '404':
 *            description: Email does not exist
 *
 *          '500':
 *            description: Internal server error
 */
generalRoutes.post('/forget-password/update', AppController.reset_password);


module.exports = { generalRoutes };
