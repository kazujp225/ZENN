'use client'

import { ReactNode, useState } from 'react'
import clsx from 'clsx'

interface Tab {
  key: string
  label: string
  content: ReactNode
}

interface SimpleTab {
  id: string
  label: string
}

interface TabItem {
  label: string
  value: string
  count?: number
}

interface TabsProps {
  tabs?: Tab[] | SimpleTab[]
  items?: TabItem[]
  defaultTab?: string
  activeTab?: string
  onChange?: (key: string) => void
  onTabChange?: (key: string) => void
}

export const Tabs = ({ tabs, items, defaultTab, activeTab: controlledActiveTab, onChange, onTabChange }: TabsProps) => {
  // itemsが渡された場合の処理
  if (items && items.length > 0) {
    const firstItemValue = items[0].value
    const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || firstItemValue)
    const activeTab = controlledActiveTab || internalActiveTab

    const handleTabClick = (value: string) => {
      if (!controlledActiveTab) {
        setInternalActiveTab(value)
      }
      onChange?.(value)
      onTabChange?.(value)
    }

    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleTabClick(item.value)}
              className={clsx(
                activeTab === item.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span
                  className={clsx(
                    activeTab === item.value
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-900',
                    'ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium'
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    )
  }

  // 従来のtabs処理
  if (!tabs || tabs.length === 0) {
    return null
  }
  
  const firstTabKey = 'key' in tabs[0] ? tabs[0].key : tabs[0].id
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || firstTabKey)
  const activeTab = controlledActiveTab || internalActiveTab

  const handleTabClick = (key: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(key)
    }
    onChange?.(key)
    onTabChange?.(key)
  }

  const isFullTab = (tab: Tab | SimpleTab): tab is Tab => {
    return 'key' in tab && 'content' in tab
  }

  return (
    <div>
      <div className="tabs" role="tablist">
        {tabs.map((tab) => {
          const tabKey = 'key' in tab ? tab.key : tab.id
          return (
            <button
              key={tabKey}
              role="tab"
              aria-selected={activeTab === tabKey}
              className={clsx('tab', {
                'tab--active': activeTab === tabKey,
              })}
              onClick={() => handleTabClick(tabKey)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      
      {tabs.some(isFullTab) && (
        <div role="tabpanel">
          {(tabs as Tab[]).find((tab) => tab.key === activeTab)?.content}
        </div>
      )}
    </div>
  )
}