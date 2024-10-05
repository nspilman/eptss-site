import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Info, Menu, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ClientPage } from './ClientPage'

export default function SeattleMusicScene() {

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <Menu className="w-6 h-6" />
        <div className="flex space-x-4">
          <Calendar className="w-6 h-6" />
          <Search className="w-6 h-6" />
          <Info className="w-6 h-6" />
        </div>
      </header>
      <ClientPage/>
    </div>
  )
}