import React from 'react'
import type { MainNavProps } from '../../types/solum'

export function MainNav({ navigationItems, onNavigate }: MainNavProps) {
  return (
    <nav className="flex items-center space-x-1">
      {navigationItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <span className="text-zinc-300 dark:text-zinc-700">/</span>}
          <button
            onClick={() => onNavigate?.(item.href)}
            className={`px-2 py-1 text-sm rounded-md transition-colors ${
              item.isActive
                ? 'font-medium text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  )
}
