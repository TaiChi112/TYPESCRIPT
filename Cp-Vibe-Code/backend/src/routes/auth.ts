import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { 
  CreateUserSchema, 
  LoginSchema, 
  AppError, 
  HTTP_STATUS,
  AuthTokens,
  AuthUser,
  JWT 
} from '@cp-vibe-code/shared';

const router = Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AppError('User already exists', HTTP_STATUS.CONFLICT, 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const tokens = await generateTokens(user.id, user.email);

    // Return user data (without password)
    const userData: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        user: userData,
        tokens,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = LoginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = await generateTokens(user.id, user.email);

    // Return user data (without password)
    const userData: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    res.json({
      success: true,
      data: {
        user: userData,
        tokens,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', HTTP_STATUS.BAD_REQUEST);
    }

    const refreshSecret = env.JWT_REFRESH_SECRET;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, refreshSecret) as any;
    
    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    // Generate new tokens
    const tokens = await generateTokens(decoded.userId, decoded.email);

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    res.json({
      success: true,
      data: { tokens },
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
});

// Generate access and refresh tokens
async function generateTokens(userId: string, email: string): Promise<AuthTokens> {
  // Generate access token
  const accessToken = jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: JWT.ACCESS_TOKEN_EXPIRES_IN }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId, email },
    env.JWT_REFRESH_SECRET,
    { expiresIn: JWT.REFRESH_TOKEN_EXPIRES_IN }
  );

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}

export default router;
