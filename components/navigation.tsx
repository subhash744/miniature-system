"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Search, Menu, X, User, LogOut } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/auth-modal'
import { getCurrentUser } from '@/lib/storage'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    setMounted(true)
    
    const fetchCurrentUser = async () => {
      if (user) {
        const profile = await getCurrentUser()
        setCurrentUser(profile)
      }
    }
    
    fetchCurrentUser()
  }, [user])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setMobileMenuOpen(false)
    }
  }

  const handleProfileClick = () => {
    if (user && currentUser) {
      router.push(`/profile/${currentUser.id}`)
      setMobileMenuOpen(false)
    }
  }

  if (!mounted) return null

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Explore", href: "/explore" },
    { label: "Hall of Fame", href: "/hall" },
    ...(user ? [{ label: "Dashboard", href: "/dashboard" }] : []),
  ]

  return (
    <>
      <nav className="border-b border-[rgba(55,50,47,0.12)] px-4 py-3 flex justify-between items-center bg-[#F7F5F3] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-1 rounded-md hover:bg-[#E0DEDB]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Logo */}
          <div 
            className="text-xl font-semibold text-[#37322F] cursor-pointer flex items-center"
            onClick={() => {
              router.push("/")
              setMobileMenuOpen(false)
            }}
          >
            Rigeo
          </div>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex gap-6 items-center absolute left-1/2 transform -translate-x-1/2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href)
                setMobileMenuOpen(false)
              }}
              className={`text-sm font-medium transition ${
                pathname === item.href ? "text-[#37322F] font-semibold" : "text-[#605A57] hover:text-[#37322F]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search bar and user actions */}
        <div className="flex gap-3 items-center">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-4 py-1.5 bg-white border border-[#E0DEDB] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#37322F] w-40 transition-all focus:w-52"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#605A57]" />
          </form>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 hover:bg-[#E0DEDB] rounded-full p-1 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#E0DEDB] flex items-center justify-center text-xs font-semibold text-[#37322F]">
                  {currentUser?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-[#37322F] font-medium hidden lg:inline">
                  {currentUser?.displayName || user.email}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-[#605A57] hover:text-[#37322F] hover:bg-[#E0DEDB] rounded-full transition"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-[#E0DEDB] text-[#37322F] rounded-full text-sm font-medium hover:bg-[#F7F5F3] transition"
            >
              Log in
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F5F3] border-b border-[rgba(55,50,47,0.12)] p-4 absolute top-full left-0 right-0 z-40">
          <div className="space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E0DEDB] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#37322F]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#605A57]" />
            </form>
            
            {/* Mobile navigation items */}
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    setMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition ${
                    pathname === item.href 
                      ? "bg-[#37322F] text-white" 
                      : "text-[#37322F] hover:bg-[#E0DEDB]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Mobile user actions */}
            {user ? (
              <div className="pt-4 border-t border-[#E0DEDB]">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left rounded-lg hover:bg-[#E0DEDB] transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E0DEDB] flex items-center justify-center text-xs font-semibold text-[#37322F]">
                    {currentUser?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-[#37322F]">
                      {currentUser?.displayName || user.email}
                    </div>
                    <div className="text-xs text-[#605A57]">View profile</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left rounded-lg text-[#605A57] hover:bg-[#E0DEDB] hover:text-[#37322F] transition mt-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      )}
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}