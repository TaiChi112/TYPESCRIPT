import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const proposalSoftwareSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  pricing: z.string().min(1, 'Pricing is required'),
  features: z.array(z.string()).default([]),
  website: z.string().url().optional().or(z.literal('')),
  company: z.string().min(1, 'Company is required'),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
});

// GET all proposal software
router.get('/', asyncHandler(async (req: any, res: any) => {
  const { page = '1', limit = '10', category, search } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { isActive: true };
  
  if (category) {
    where.category = category;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { company: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [proposalSoftware, total] = await Promise.all([
    prisma.proposalSoftware.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.proposalSoftware.count({ where }),
  ]);

  res.json({
    data: proposalSoftware,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}));

// GET single proposal software by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposalSoftware = await prisma.proposalSoftware.findUnique({
      where: { id },
    });

    if (!proposalSoftware) {
      return res.status(404).json({ error: 'Proposal software not found' });
    }

    res.json(proposalSoftware);
  } catch (error) {
    console.error('Error fetching proposal software:', error);
    res.status(500).json({ error: 'Failed to fetch proposal software' });
  }
});

// POST create new proposal software
router.post('/', async (req, res) => {
  try {
    const validatedData = proposalSoftwareSchema.parse(req.body);
    
    const proposalSoftware = await prisma.proposalSoftware.create({
      data: validatedData,
    });

    res.status(201).json(proposalSoftware);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    console.error('Error creating proposal software:', error);
    res.status(500).json({ error: 'Failed to create proposal software' });
  }
});

// PUT update proposal software
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = proposalSoftwareSchema.partial().parse(req.body);

    const proposalSoftware = await prisma.proposalSoftware.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    res.json(proposalSoftware);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    console.error('Error updating proposal software:', error);
    res.status(500).json({ error: 'Failed to update proposal software' });
  }
});

// DELETE proposal software (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.proposalSoftware.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Proposal software deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal software:', error);
    res.status(500).json({ error: 'Failed to delete proposal software' });
  }
});

// GET categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await prisma.proposalSoftware.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    res.json(categories.map((c: any) => c.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export { router as proposalSoftwareRoutes };
