import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth'

// Import Prisma from the database package
const { prisma } = require('@icatalyst/database')

const router = Router()

// Use authentication middleware for all project routes
router.use(authenticateToken as any)

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  projectType: z.enum(['new-install', 'upgrade', 'service', 'design-only']),
  customerId: z.string().uuid(),
  propertyId: z.string().uuid().optional(),
  primaryPartnerId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  projectedFinishDate: z.string().optional(),
  materialDeliveryDate: z.string().optional(),
  estimatedValue: z.number().optional(),
  templateId: z.string().uuid().optional(),
})

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'on-hold', 'cancelled']).optional(),
  projectType: z.enum(['new-install', 'upgrade', 'service', 'design-only']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectedFinishDate: z.string().optional(),
  materialDeliveryDate: z.string().optional(),
  estimatedValue: z.number().optional(),
  actualCost: z.number().optional(),
  materialsCost: z.number().optional(),
  laborCost: z.number().optional(),
  hardwareCost: z.number().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  primaryPartnerId: z.string().uuid().optional(),
})

const addProjectPartnerSchema = z.object({
  partnerId: z.string().uuid(),
  role: z.string().optional(),
})

const addProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['project-manager', 'technician', 'laborer', 'subcontractor']),
  isLaborer: z.boolean().default(false),
})

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
})

const createChangeOrderSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  reason: z.enum(['scope-change', 'cost-adjustment', 'timeline-change']),
  costChange: z.number(),
})

// Get all projects with filtering and search
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, partnerId, customerId, search, page = '1', limit = '10' } = req.query
    
    const whereClause: any = {
      organizationId: req.user!.organizationId
    }
    
    // Apply filters
    if (status) whereClause.status = status
    if (partnerId) whereClause.primaryPartnerId = partnerId
    if (customerId) whereClause.customerId = customerId
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          customer: {
            select: { firstName: true, lastName: true, email: true }
          },
          primaryPartner: {
            select: { companyName: true, contactName: true, type: true }
          },
          property: {
            select: { name: true, address: true, city: true, state: true }
          },
          projectPartners: {
            include: {
              partner: {
                select: { companyName: true, contactName: true, type: true }
              }
            }
          },
          projectMembers: {
            select: { userId: true, role: true, isLaborer: true }
          },
          _count: {
            select: {
              documents: true,
              tasks: true,
              changeOrders: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take
      }),
      prisma.project.count({ where: whereClause })
    ])
    
    res.json({
      projects,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// Get project by ID with full details
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      },
      include: {
        customer: true,
        property: true,
        primaryPartner: true,
        projectPartners: {
          include: {
            partner: true
          }
        },
        projectMembers: true,
        documents: {
          orderBy: { uploadedAt: 'desc' }
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        changeOrders: {
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          orderBy: [{ status: 'asc' }, { sortOrder: 'asc' }]
        },
        proposals: {
          select: { id: true, name: true, status: true }
        }
      }
    })
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    
    res.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// Create new project
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = createProjectSchema.parse(req.body)
    
    // Verify customer belongs to organization
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        organizationId: req.user!.organizationId
      }
    })
    
    if (!customer) {
      res.status(400).json({ error: 'Customer not found' })
      return
    }
    
    // If using template, get template data
    let templateData = null
    if (data.templateId) {
      templateData = await prisma.projectTemplate.findFirst({
        where: {
          id: data.templateId,
          organizationId: req.user!.organizationId
        }
      })
    }
    
    const project = await prisma.$transaction(async (tx: any) => {
      // Create project
      const newProject = await tx.project.create({
        data: {
          ...data,
          organizationId: req.user!.organizationId,
          status: 'planning',
          startDate: data.startDate ? new Date(data.startDate) : null,
          projectedFinishDate: data.projectedFinishDate ? new Date(data.projectedFinishDate) : null,
          materialDeliveryDate: data.materialDeliveryDate ? new Date(data.materialDeliveryDate) : null,
          estimatedValue: templateData?.defaultBudget || data.estimatedValue,
        }
      })
      
      // Add default tasks from template
      if (templateData?.defaultTasks) {
        const tasks = Array.isArray(templateData.defaultTasks) ? templateData.defaultTasks : []
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i]
          await tx.projectTask.create({
            data: {
              projectId: newProject.id,
              title: task.title || `Task ${i + 1}`,
              description: task.description,
              priority: task.priority || 'medium',
              status: 'pending',
              sortOrder: i,
              createdBy: req.user!.userId
            }
          })
        }
      }
      
      // Log activity
      await tx.projectActivity.create({
        data: {
          projectId: newProject.id,
          type: 'status-change',
          title: 'Project created',
          description: `Project "${newProject.name}" was created`,
          newValue: 'planning',
          createdBy: req.user!.userId
        }
      })
      
      // Update template usage
      if (templateData) {
        await tx.projectTemplate.update({
          where: { id: templateData.id },
          data: { timesUsed: { increment: 1 } }
        })
      }
      
      return newProject
    })
    
    res.status(201).json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors })
    } else {
      res.status(500).json({ error: 'Failed to create project' })
    }
  }
})

// Update project
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = updateProjectSchema.parse(req.body)
    
    // Get current project for change tracking
    const currentProject = await prisma.project.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      }
    })
    
    if (!currentProject) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    
    const updateData: any = { ...data }
    
    // Handle date conversions
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)
    if (data.projectedFinishDate) updateData.projectedFinishDate = new Date(data.projectedFinishDate)
    if (data.materialDeliveryDate) updateData.materialDeliveryDate = new Date(data.materialDeliveryDate)
    
    const project = await prisma.$transaction(async (tx: any) => {
      const updatedProject = await tx.project.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          primaryPartner: true
        }
      })
      
      // Log significant changes
      const changes = []
      if (data.status && data.status !== currentProject.status) {
        changes.push({
          type: 'status-change',
          title: `Status changed from ${currentProject.status} to ${data.status}`,
          oldValue: currentProject.status,
          newValue: data.status
        })
      }
      
      if (data.progressPercent !== undefined && data.progressPercent !== currentProject.progressPercent) {
        changes.push({
          type: 'progress-update',
          title: `Progress updated to ${data.progressPercent}%`,
          oldValue: currentProject.progressPercent?.toString(),
          newValue: data.progressPercent.toString()
        })
      }
      
      // Log all changes
      for (const change of changes) {
        await tx.projectActivity.create({
          data: {
            projectId: id,
            ...change,
            createdBy: req.user!.userId
          }
        })
      }
      
      return updatedProject
    })
    
    res.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors })
    } else {
      res.status(500).json({ error: 'Failed to update project' })
    }
  }
})

// Delete project
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      }
    })
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    
    await prisma.project.delete({
      where: { id }
    })
    
    res.json({ success: true, message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

// Add partner to project
router.post('/:id/partners', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = addProjectPartnerSchema.parse(req.body)
    
    // Verify project exists and belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      }
    })
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    
    const projectPartner = await prisma.$transaction(async (tx: any) => {
      const newProjectPartner = await tx.projectPartner.create({
        data: {
          projectId: id,
          partnerId: data.partnerId,
          role: data.role
        },
        include: {
          partner: {
            select: { companyName: true, contactName: true, type: true }
          }
        }
      })
      
      // Log activity
      await tx.projectActivity.create({
        data: {
          projectId: id,
          type: 'member-added',
          title: `Partner added: ${newProjectPartner.partner.companyName}`,
          description: `Added ${newProjectPartner.partner.companyName} as ${data.role || 'collaborator'}`,
          createdBy: req.user!.userId
        }
      })
      
      return newProjectPartner
    })
    
    res.status(201).json(projectPartner)
  } catch (error) {
    console.error('Error adding partner to project:', error)
    res.status(500).json({ error: 'Failed to add partner to project' })
  }
})

// Remove partner from project
router.delete('/:id/partners/:partnerId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, partnerId } = req.params
    
    await prisma.projectPartner.deleteMany({
      where: {
        projectId: id,
        partnerId,
        project: {
          organizationId: req.user!.organizationId
        }
      }
    })
    
    res.json({ success: true, message: 'Partner removed from project' })
  } catch (error) {
    console.error('Error removing partner from project:', error)
    res.status(500).json({ error: 'Failed to remove partner from project' })
  }
})

// Add team member to project
router.post('/:id/members', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = addProjectMemberSchema.parse(req.body)
    
    const projectMember = await prisma.$transaction(async (tx: any) => {
      const newProjectMember = await tx.projectMember.create({
        data: {
          projectId: id,
          userId: data.userId,
          role: data.role,
          isLaborer: data.isLaborer
        }
      })
      
      // Log activity
      await tx.projectActivity.create({
        data: {
          projectId: id,
          type: 'member-added',
          title: `Team member added`,
          description: `Added team member as ${data.role}`,
          createdBy: req.user!.userId
        }
      })
      
      return newProjectMember
    })
    
    res.status(201).json(projectMember)
  } catch (error) {
    console.error('Error adding member to project:', error)
    res.status(500).json({ error: 'Failed to add member to project' })
  }
})

// Get project tasks
router.get('/:id/tasks', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    const tasks = await prisma.projectTask.findMany({
      where: {
        projectId: id,
        project: {
          organizationId: req.user!.organizationId
        }
      },
      orderBy: [{ status: 'asc' }, { sortOrder: 'asc' }]
    })
    
    res.json(tasks)
  } catch (error) {
    console.error('Error fetching project tasks:', error)
    res.status(500).json({ error: 'Failed to fetch project tasks' })
  }
})

// Create project task
router.post('/:id/tasks', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = createTaskSchema.parse(req.body)
    
    const task = await prisma.$transaction(async (tx: any) => {
      // Get next sort order
      const lastTask = await tx.projectTask.findFirst({
        where: { projectId: id },
        orderBy: { sortOrder: 'desc' }
      })
      
      const newTask = await tx.projectTask.create({
        data: {
          projectId: id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          assignedTo: data.assignedTo,
          status: 'pending',
          sortOrder: (lastTask?.sortOrder || 0) + 1,
          createdBy: req.user!.userId
        }
      })
      
      // Log activity
      await tx.projectActivity.create({
        data: {
          projectId: id,
          type: 'task-added',
          title: `Task created: ${data.title}`,
          createdBy: req.user!.userId
        }
      })
      
      return newTask
    })
    
    res.status(201).json(task)
  } catch (error) {
    console.error('Error creating project task:', error)
    res.status(500).json({ error: 'Failed to create project task' })
  }
})

// Update task status
router.put('/:id/tasks/:taskId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, taskId } = req.params
    const { status, title, description, priority, dueDate, assignedTo } = req.body
    
    const updateData: any = {}
    if (status) updateData.status = status
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority) updateData.priority = priority
    if (dueDate) updateData.dueDate = new Date(dueDate)
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (status === 'completed') updateData.completedAt = new Date()
    
    const task = await prisma.projectTask.update({
      where: {
        id: taskId,
        project: {
          organizationId: req.user!.organizationId
        }
      },
      data: updateData
    })
    
    res.json(task)
  } catch (error) {
    console.error('Error updating project task:', error)
    res.status(500).json({ error: 'Failed to update project task' })
  }
})

// Create change order
router.post('/:id/change-orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = createChangeOrderSchema.parse(req.body)
    
    const changeOrder = await prisma.$transaction(async (tx: any) => {
      const newChangeOrder = await tx.changeOrder.create({
        data: {
          projectId: id,
          title: data.title,
          description: data.description,
          reason: data.reason,
          costChange: data.costChange,
          status: 'pending',
          createdBy: req.user!.userId
        }
      })
      
      // Log activity
      await tx.projectActivity.create({
        data: {
          projectId: id,
          type: 'change-order',
          title: `Change order created: ${data.title}`,
          description: `Cost impact: ${data.costChange >= 0 ? '+' : ''}$${data.costChange}`,
          createdBy: req.user!.userId
        }
      })
      
      return newChangeOrder
    })
    
    res.status(201).json(changeOrder)
  } catch (error) {
    console.error('Error creating change order:', error)
    res.status(500).json({ error: 'Failed to create change order' })
  }
})

// Approve/reject change order
router.put('/:id/change-orders/:changeOrderId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, changeOrderId } = req.params
    const { status } = req.body // approved or rejected
    
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Status must be approved or rejected' })
      return
    }
    
    const changeOrder = await prisma.$transaction(async (tx: any) => {
      const updatedChangeOrder = await tx.changeOrder.update({
        where: {
          id: changeOrderId,
          project: {
            organizationId: req.user!.organizationId
          }
        },
        data: {
          status,
          approvedBy: req.user!.userId,
          approvedAt: new Date()
        }
      })
      
      // If approved, update project budget
      if (status === 'approved') {
        await tx.project.update({
          where: { id },
          data: {
            actualCost: {
              increment: updatedChangeOrder.costChange
            }
          }
        })
      }
      
      // Log activity
      await tx.projectActivity.create({
        data: {
          projectId: id,
          type: 'change-order',
          title: `Change order ${status}: ${updatedChangeOrder.title}`,
          createdBy: req.user!.userId
        }
      })
      
      return updatedChangeOrder
    })
    
    res.json(changeOrder)
  } catch (error) {
    console.error('Error updating change order:', error)
    res.status(500).json({ error: 'Failed to update change order' })
  }
})

// Get project activity log
router.get('/:id/activity', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { limit = '50' } = req.query
    
    const activities = await prisma.projectActivity.findMany({
      where: {
        projectId: id,
        project: {
          organizationId: req.user!.organizationId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    })
    
    res.json(activities)
  } catch (error) {
    console.error('Error fetching project activity:', error)
    res.status(500).json({ error: 'Failed to fetch project activity' })
  }
})

// Add activity note
router.post('/:id/activity', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, description } = req.body
    
    const activity = await prisma.projectActivity.create({
      data: {
        projectId: id,
        type: 'note-added',
        title: title || 'Note added',
        description,
        createdBy: req.user!.userId
      }
    })
    
    res.status(201).json(activity)
  } catch (error) {
    console.error('Error adding project note:', error)
    res.status(500).json({ error: 'Failed to add project note' })
  }
})

export { router as projectRoutes }