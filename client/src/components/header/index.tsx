import React, { ReactNode } from 'react'
import { LanguageSelector } from '../language-selector'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'
import { Github } from 'lucide-react'

interface IProps {
  leftNode?: ReactNode
}
export function Header(props: IProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed left-0 top-0 flex w-full items-center justify-between border bg-slate-50 bg-opacity-70 px-4 py-4 md:px-12">
      <div className="flex items-center gap-6">
        <a href="/" className="text-xs md:text-base font-semibold">
          Story Generator
        </a>
        <nav className="hidden md:flex items-center gap-4">
          <a href="/" className="text-sm hover:text-blue-600 transition-colors">
            Generate Stories
          </a>
          <a href="#/about" className="text-sm hover:text-blue-600 transition-colors">
            About
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSelector />
        <Button size={'icon'} asChild className="rounded-full">
          <a href="https://github.com/Quilljou/vite-react-ts-tailwind-starter" target="_blank" rel="noreferrer">
            <Github />
          </a>
        </Button>
      </div>
    </div>
  )
}
