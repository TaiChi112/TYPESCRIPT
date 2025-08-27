import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, authenticate } from '@/middleware/auth';
import { PrismaClient } from '@prisma/client';
import { HTTP_STATUS, AuthUser } from '@cp-vibe-code/shared';

const router = Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    const userData: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
