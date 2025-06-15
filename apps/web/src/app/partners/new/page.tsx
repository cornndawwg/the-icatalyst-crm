'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { partnersApi } from '@/lib/api'

const partnerSchema = z.object({
  type: z.enum(['interior-designer', 'builder', 'architect'], {
    required_error: 'Please select a partner type'
  }),
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  specialties: z.string().optional(),
  notes: z.string().optional()
})

type PartnerForm = z.infer<typeof partnerSchema>

export default function NewPartnerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PartnerForm>({
    resolver: zodResolver(partnerSchema)
  })

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          router.push('/login')
          return false
        }
      }
      return true
    }

    checkAuth()
  }, [router])

  const onSubmit = async (data: PartnerForm) => {
    try {
      setIsSubmitting(true)
      
      const partnerData = {
        ...data,
        specialties: data.specialties ? data.specialties.split(',').map(s => s.trim()) : []
      }

      await partnersApi.create(partnerData)
      router.push('/partners')
    } catch (error) {
      console.error('Error creating partner:', error)
      const errorMessage = error instanceof Error && error.message.includes('duplicate')
        ? 'A partner with this email already exists'
        : 'Failed to create partner'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/partners')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Partner</h1>
              <p className="text-sm text-gray-600 mt-1">
                Create a new partnership relationship
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Partner Information</CardTitle>
            <CardDescription>
              Enter the details for your new business partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Partner Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Partner Type *</Label>
                <Select onValueChange={(value) => setValue('type', value as 'interior-designer' | 'builder' | 'architect')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior-designer">Interior Designer</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                    <SelectItem value="architect">Architect</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  placeholder="ABC Design Studio"
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              {/* Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  {...register('contactName')}
                  placeholder="John Doe"
                />
                {errors.contactName && (
                  <p className="text-sm text-red-600">{errors.contactName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...register('website')}
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <p className="text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  {...register('specialties')}
                  placeholder="Modern homes, Kitchen design, Luxury spaces (comma separated)"
                />
                <p className="text-sm text-gray-500">
                  Enter specialties separated by commas
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Additional notes about this partner..."
                  rows={4}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/partners')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Partner'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  )
}