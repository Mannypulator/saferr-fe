'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  QrCodeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon, // Icon for Brands
  CubeIcon, // Icon for Products
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Brands", href: "/dashboard/brands", icon: BuildingStorefrontIcon }, // Add Brands
  { name: "Products", href: "/dashboard/products", icon: CubeIcon }, // Add Products
  {
    name: "Generate Codes",
    href: "/dashboard/codes/generate",
    icon: QrCodeIcon,
  },
  { name: "Reports", href: "/dashboard/reports", icon: ChartBarIcon },
  {
    name: "Suspicious Activity",
    href: "/dashboard/reports/suspicious",
    icon: ExclamationTriangleIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-lg font-semibold text-gray-800">Brand Dashboard</span>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4`}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}