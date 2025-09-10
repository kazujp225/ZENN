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

interface TabsProps {
  tabs: Tab[] | SimpleTab[]
  defaultTab?: string
  activeTab?: string
  onChange?: (key: string) => void
  onTabChange?: (key: string) => void
}

export const Tabs = ({ tabs, defaultTab, activeTab: controlledActiveTab, onChange, onTabChange }: TabsProps) => {
  // 空配列チェックを追加
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