import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import { User, CreateUserRequest } from '@company/shared-types'

const router = Router()

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format')
})

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional()
})

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    res.json({
      data: users,
      message: 'Users retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      error: 'Failed to fetch users'
    })
  }
})

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }
    
    res.json({
      data: user,
      message: 'User retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({
      error: 'Failed to fetch user'
    })
  }
})

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validation = createUserSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      })
    }
    
    const { name, email } = validation.data
    
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      })
    }
    
    // Create new user
    const user = await prisma.user.create({
      data: { name, email }
    })
    
    res.status(201).json({
      data: user,
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({
      error: 'Failed to create user'
    })
  }
})

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Validate request body
    const validation = updateUserSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      })
    }
    
    const updateData = validation.data
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found'
      })
    }
    
    // Check if email is being updated and already exists
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      })
      
      if (emailExists) {
        return res.status(409).json({
          error: 'User with this email already exists'
        })
      }
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })
    
    res.json({
      data: user,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({
      error: 'Failed to update user'
    })
  }
})

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found'
      })
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id }
    })
    
    res.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({
      error: 'Failed to delete user'
    })
  }
})

export { router as userRoutes }
