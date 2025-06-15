'use client'

import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Building2, 
  FolderOpen, 
  MoreHorizontal,
  Settings,
  Users,
  Mail,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

interface MoreItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  description?: string
}

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    id: 'partners',
    label: 'Partners',
    icon: Building2,
    href: '/partners'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    href: '/projects'
  },
  {
    id: 'more',
    label: 'More',
    icon: MoreHorizontal,
    href: '#'
  }
]

const moreItems: MoreItem[] = [
  {
    id: 'future-partners',
    label: 'Future Partners',
    icon: Users,
    href: '/future-partners',
    description: 'Partner pipeline and nurturing'
  },
  {
    id: 'campaigns',
    label: 'Email Campaigns',
    icon: Mail,
    href: '/campaigns',
    description: 'Campaign management for all contacts'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    description: 'Account and organization settings'
  }
]

export default function BottomTabs() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      router.push('/login')
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'dashboard'
    if (pathname.startsWith('/partners')) return 'partners'
    if (pathname.startsWith('/projects')) return 'projects'
    if (pathname.startsWith('/future-partners') || pathname.startsWith('/campaigns') || pathname.startsWith('/settings')) return 'more'
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          if (tab.id === 'more') {
            return (
              <Sheet key={tab.id}>
                <SheetTrigger asChild>
                  <button
                    className={`flex flex-col items-center justify-center gap-1 px-1 py-2 text-xs transition-colors ${
                      getActiveTab() === 'more'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh]">
                  <SheetHeader>
                    <SheetTitle>More Options</SheetTitle>
                    <SheetDescription>
                      Additional features and settings
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-1">
                    {moreItems.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-4"
                        onClick={() => router.push(item.href)}
                      >
                        <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </Button>
                    ))}
                    
                    <div className="border-t pt-4 mt-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Sign Out</div>
                          <div className="text-sm text-gray-500">Log out of your account</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center justify-center gap-1 px-1 py-2 text-xs transition-colors ${
                isActive(tab.href)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <tab.icon className="h-5 w-5" />
                {tab.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}