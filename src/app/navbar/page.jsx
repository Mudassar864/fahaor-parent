'use client';

import React, { useState, useEffect } from "react";
import { usePathname ,useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Calendar,
  CheckSquare,
  Gift,
  ShoppingCart,
  DollarSign,
  Utensils,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  User,
Lock,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/LanguageContext";



export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const navItems = [
    // { icon: Calendar, label: "calendar", href: "/calendar" },
    { icon: CheckSquare, label: "tasks", href: "/child-details/child-data/" },
    { icon: Utensils, label: "mealPlanner", href: "/meal-planner" },
    { icon: DollarSign, label: "finance", href: "/finance-budged/finance-card" }, 
  ];
  const [userData, setUserData] = useState(null); // State for user data
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Start with null to represent unknown state
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // Check if running on the client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token); // Update authentication state

      if (token) {
        fetchUserData(token);
      } else {
        // Optionally, you can redirect to login or handle unauthenticated state here
        setIsAuthenticated(false);
      }
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // router.push('/auth/login');
    window.location.reload();  // This will refresh the page

  };

  // Don't render the Navbar until authentication state is known
  if (isAuthenticated === null) {
    return null; // Or you can return a loader here
  }

  // If not authenticated, optionally render nothing or minimal Navbar
  if (!isAuthenticated) {
    return null; // Or render a minimal Navbar without user-specific data
  }
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
        <Avatar>
  {userData && userData.profilePicture ? (
    <AvatarImage src={userData.profilePicture} alt={userData.fullName || 'User'} />
  ) : (
    <AvatarFallback>{userData?.fullName?.charAt(0) || 'U'}</AvatarFallback>
  )}
</Avatar>
<div className="hidden md:block">
  <h1 className="text-lg font-semibold">
    {t?.welcome || "Welcome"}, {userData?.fullName || 'User'}!
  </h1>
  <p className="text-sm text-muted-foreground">
    {t?.haveAGreatDay || "Have a great day!"}
  </p>
</div>


        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4">
          {[{ icon: Calendar, label: "Calender", href: "/calender" }, ...navItems].map((item, index) => (
            <Button
              key={index}
              variant={pathname === item.href ? "default" : "ghost"}
              asChild
            >
              <Link href={item.href} className="flex items-center space-x-2">
                <item.icon className="h-4 w-4" />
                <span>{t[item.label.toLowerCase()] || item.label}</span>
              </Link>
            </Button>
          ))}

      
        </nav>
        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {/* Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[150px] justify-between">
              {language === "en"
  ? "English"
  : language === "es"
  ? "Español"
  : language === "fr"
  ? "Français"
  : language === "de"
  ? "Deutsch"
  : language === "ru"
  ? "Русский"
  : language === "nl"
  ? "Nederlands"
  : language === "it"
  ? "Italiano"
  : language === "tr"
  ? "Türkçe"
  : language === "pt"
  ? "Português"
  : "Unknown Language"}

                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("es")}>Español</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("fr")}>Français</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("de")}>Deutsch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ru")}>Русский</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar>
                  <AvatarImage src="/user-avatar.svg" alt="User Profile" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/password">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Password</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <div className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[{ icon: Calendar, label: "Home", href: "/calender" }, ...navItems].map((item, index) => (
                <DropdownMenuItem key={index} asChild>
                  <Link href={item.href} className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4" />
                    <span>{t[item.label.toLowerCase()] || item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              {/* Finance Dropdown Items */}
              {/* <DropdownMenuItem asChild>
                <Link href="/finance/budget" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>{t.budget || "Budget"}</span>
                </Link>
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem asChild>
                <Link href="/finance/shopping" className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{t.shopping || "Shopping"}</span>
                </Link>
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem asChild>
                <Link href="/finance/rewards" className="flex items-center space-x-2">
                  <Gift className="h-4 w-4" />
                  <span>{t.rewards || "Rewards"}</span>
                </Link>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
