import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthenticationError } from '../middleware/errorHandler';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'stockfilter-pro',
    audience: 'stockfilter-users',
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'stockfilter-pro',
    audience: 'stockfilter-users',
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Extract expiry time from token
  const decoded = jwt.decode(accessToken) as any;
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
  
  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      issuer: 'stockfilter-pro',
      audience: 'stockfilter-users',
    }) as JWTPayload;
    
    return payload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired access token');
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'stockfilter-pro',
      audience: 'stockfilter-users',
    }) as JWTPayload;
    
    return payload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
}

/**
 * Verify JWT token (generic)
 */
export function verifyJWT(token: string): JWTPayload {
  return verifyAccessToken(token);
}

/**
 * Decode JWT token without verification
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded.exp;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  
  return Date.now() >= expiry * 1000;
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}