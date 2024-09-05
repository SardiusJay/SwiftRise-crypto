/**
 * Contains the JwtService class
 * handles all jwt operations
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
const jwt = require('jsonwebtoken');
const { storage } = require('../models/engine/db_storage');
require('dotenv').config();

class JwtService {
  constructor (){
    this._expiresIn = '1h';
    this._refreshExpiresIn = '7d';
  }

  /**
   * Generates a token based on the provided payload.
   *
   * @param {Object} payload - The payload used to generate the token.
   * @param {boolean} just_access=false - Determines if only the access token should be generated.
   * @return {string|Object} - The generated token(s).
   */
  async generate_token(payload, just_access=false) {
    try {
      if(just_access) {
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: this._expiresIn });
        return accessToken;
      }
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: this._expiresIn });
      const refreshToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: this._refreshExpiresIn });
      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Middleware function to authenticate token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @return {Promise<void>} - No return value.
 */
const authenticate_token_middleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

    // if token is absent
    if (!token) {
      return res
        .status(401)
        .json({
          msg: 'Jwt token required'
        });
    }

    // if token has logged out
    const jwt_token = await storage.get_jwt(token);
    if (jwt_token) {
      return res
      .status(401)
      .json({
        msg: 'Token logged out, get a new access token at /api/v1/general/refresh-token or login again',
        second_chance: true
      });
    }

    // if token is valid
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res
          .status(401)
          .json({
            msg: 'Token expired, get a new access token at /api/v1/general/refresh-token or login again',
            second_chance: true
          });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    throw error;
  }
}

const jwt_service = new JwtService(); 

module.exports = { jwt_service, authenticate_token_middleware };
