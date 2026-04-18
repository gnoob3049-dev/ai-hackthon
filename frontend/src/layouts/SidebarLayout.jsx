import { useState } from 'react'
import { LayoutDashboard, UserCog, Menu, Bell, Search, Sparkles, TrendingUp, ChevronUp, Clock, Zap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

export default function SidebarLayout({ children, activeTab, setActiveTab, profile }) {
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <div className="flex h-screen w-full bg-[#09090b] text-foreground font-sans overflow-hidden">
      {/* Sidebar: Fixed 240px */}
      <motion.aside 
        initial={false}
        animate={{ width: collapsed ? 80 : 240 }}
        className="relative z-40 bg-[#111113] border-r border-white/5 backdrop-blur-xl flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out"
      >
        {/* Logo Area */}
        <div className="h-14 flex items-center px-4 border-b border-white/5 gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy/30 text-brand-silver">
            <Zap size={18} fill="currentColor" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-white/90">
              OpportunityOS
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          <div className="space-y-1">
            <NavBtn 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              collapsed={collapsed}
              onClick={() => setActiveTab('dashboard')}
            />
            <NavBtn 
              icon={<Sparkles size={18} />} 
              label="Opportunities" 
              active={activeTab === 'opportunities'} 
              collapsed={collapsed}
              badge="12"
              onClick={() => setActiveTab('dashboard')} // Linking to dashboard for now
            />
            <NavBtn 
              icon={<TrendingUp size={18} />} 
              label="Insights" 
              active={activeTab === 'insights'} 
              collapsed={collapsed}
              onClick={() => setActiveTab('dashboard')}
            />
          </div>

          {!collapsed && (
            <div className="mt-8 px-3">
              <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">
                Account
              </span>
            </div>
          )}

          <div className="mt-2 space-y-1">
            <NavBtn 
              icon={<UserCog size={18} />} 
              label="Profile" 
              active={activeTab === 'profile'} 
              collapsed={collapsed}
              onClick={() => setActiveTab('profile')}
            />
          </div>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-white/5 bg-white/2 mt-auto">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group`}>
            <Avatar className="h-7 w-7 border-2 border-white/10">
              <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.name || 'User'}`} />
              <AvatarFallback className="bg-gradient-to-br from-brand-navy to-blue-600 text-[10px] font-bold">
                {profile?.name ? profile.name[0] : 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/90 truncate">{profile?.name || 'User'}</p>
                <p className="text-[11px] text-zinc-500 truncate lowercase">{profile?.semester || 'Setup Profile'}</p>
              </div>
            )}
            {!collapsed && <ChevronUp size={14} className="text-zinc-600 group-hover:text-zinc-400" />}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar: Fixed 56px */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl z-30 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="sm:hidden text-zinc-400">
              <Menu size={18} />
            </Button>
            <h1 className="text-sm font-semibold text-white/90 hidden md:block">
              {activeTab === 'dashboard' ? 'Overview' : 'Intelligence Profile'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden lg:flex items-center group">
              <Search className="absolute left-3 text-zinc-500 group-focus-within:text-brand-silver transition-colors" size={14} />
              <Input 
                placeholder="Search resources..." 
                className="w-64 h-8 pl-9 pr-12 bg-white/5 border-white/10 focus-visible:ring-brand-silver/30 h-8 text-xs rounded-lg"
              />
              <div className="absolute right-2 px-1 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] text-zinc-500 font-mono">
                ⌘K
              </div>
            </div>

            <div className="h-4 w-[1px] bg-white/10 mx-1 hidden lg:block" />

            {/* Status & Actions */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[11px] font-medium px-2 py-0.5 hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Synced
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-navy" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Page Content: Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function NavBtn({ icon, label, active, collapsed, badge, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`relative w-full flex items-center h-9 px-2.5 rounded-lg transition-all duration-150 group
        ${active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-400'}`}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-0.5 h-4 bg-brand-silver rounded-full"
        />
      )}
      <span className={`${active ? 'text-brand-silver' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="ml-3 text-[13px] font-medium tracking-tight flex-1 text-left">
          {label}
        </span>
      )}
      {!collapsed && badge && (
        <span className="bg-brand-navy/20 text-brand-silver text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}
