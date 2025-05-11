"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { 
  LayoutGrid, 
  Settings, 
  LogOut, 
  History, 
  ChevronRight, 
  Menu, 
  X, 
  FlaskRoundIcon as Flask, 
  Command, 
  Search, 
  Keyboard,
  Zap,
  BarChart, 
  Save,
  ArrowRight
} from "lucide-react"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator, 
  CommandShortcut 
} from "@/components/ui/command"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface AppLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [version, setVersion] = useState('0.0.0');
  const { toast } = useToast()

  // set up keyboard shortcut for the command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    import('../package.json').then(pkg => {
      setVersion(pkg.version);
    }).catch(err => {
      console.error('Failed to load version:', err);
    });
  }, []);

  const navigation = [
    { name: "Playground", href: "/playground", icon: LayoutGrid },
    { name: "Mutations", href: "/mutations", icon: Zap },
    { name: "History", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/playground" className="flex items-center gap-2">
              <Flask className="h-6 w-6 text-primary" />
              <span className="font-semibold">mutatio.dev</span>
            </Link>
            <Badge variant="outline" className="text-[10px] sm:text-xs font-normal bg-indigo-50 text-indigo-500 py-0.5">
               v{version}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Sign out</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ModeToggle />
            <div 
              className="flex items-center text-xs text-muted-foreground gap-1.5 cursor-pointer mr-2" 
              onClick={() => setCommandOpen(true)}
            >
              <kbd className="px-2 py-0.5 bg-muted border rounded text-[10px]">
                <Command className="h-3 w-3 inline-block mr-1" />K
              </kbd>
              <span className="hidden sm:inline-block">for commands</span>
            </div>
            <div className="ml-2 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 text-center text-xs font-medium leading-6 text-primary">
                {user?.name?.[0] || user?.email?.[0] || "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation menu */}
      <div className={cn(
        "fixed inset-0 z-30 md:hidden transition-all duration-300 ease-in-out",
        isMobileMenuOpen ? "visible" : "invisible"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu content */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-3/4 max-w-xs bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-14 border-b flex items-center px-4">
            <Flask className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold text-sm">mutatio.dev</span>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-6 p-2 bg-muted/30 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-center text-sm font-medium leading-8 text-primary flex-shrink-0">
                {user?.name?.[0] || user?.email?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || user?.email || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <div className="hidden border-r md:block">
          <div className="flex h-full w-[200px] flex-col">
            <nav className="flex flex-1 flex-col gap-1 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => {router.push("/playground"); setCommandOpen(false);}}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Go to Playground</span>
              {pathname !== "/playground" && <CommandShortcut>⌘P</CommandShortcut>}
            </CommandItem>
            <CommandItem onSelect={() => {router.push("/history"); setCommandOpen(false);}}>
              <History className="mr-2 h-4 w-4" />
              <span>Go to History</span>
              {pathname !== "/history" && <CommandShortcut>⌘H</CommandShortcut>}
            </CommandItem>
            <CommandItem onSelect={() => {router.push("/settings"); setCommandOpen(false);}}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Go to Settings</span>
              {pathname !== "/settings" && <CommandShortcut>⌘,</CommandShortcut>}
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />
          
          {pathname === "/settings" && (
            <CommandGroup heading="Settings">
              <CommandItem onSelect={() => {
                const tabsElement = document.querySelector("[role='tablist']");
                if (tabsElement) {
                  const modelsTab = tabsElement.querySelector("[data-state='inactive'][value='models']");
                  if (modelsTab) {
                    (modelsTab as HTMLElement).click();
                    toast({
                      title: "Switched to Models tab",
                      duration: 1000,
                    });
                  }
                }
                setCommandOpen(false);
              }}>
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Switch to Models Tab</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                const tabsElement = document.querySelector("[role='tablist']");
                if (tabsElement) {
                  const typesTab = tabsElement.querySelector("[data-state='inactive'][value='mutation-types']");
                  if (typesTab) {
                    (typesTab as HTMLElement).click();
                    toast({
                      title: "Switched to Mutation Types tab",
                      duration: 1000,
                    });
                  }
                }
                setCommandOpen(false);
              }}>
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Switch to Mutation Types Tab</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                const tabsElement = document.querySelector("[role='tablist']");
                if (tabsElement) {
                  const accountTab = tabsElement.querySelector("[data-state='inactive'][value='account']");
                  if (accountTab) {
                    (accountTab as HTMLElement).click();
                    toast({
                      title: "Switched to Account tab",
                      duration: 1000,
                    });
                  }
                }
                setCommandOpen(false);
              }}>
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Switch to Account Tab</span>
              </CommandItem>
            </CommandGroup>
          )}

          {pathname === "/history" && (
            <CommandGroup heading="History">
              <CommandItem onSelect={() => {
                const searchInput = document.querySelector("input[type='search']") as HTMLInputElement;
                if (searchInput) {
                  searchInput.focus();
                  toast({
                    title: "Search focused",
                    duration: 1000,
                  });
                }
                setCommandOpen(false);
              }}>
                <Search className="mr-2 h-4 w-4" />
                <span>Focus Search</span>
                <CommandShortcut>⌘F</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => {
                const tabsElement = document.querySelector("[role='tablist']");
                if (tabsElement) {
                  const allTab = tabsElement.querySelector("[data-state='inactive'][value='all']");
                  if (allTab) {
                    (allTab as HTMLElement).click();
                    toast({
                      title: "Switched to All Sessions tab",
                      duration: 1000,
                    });
                  }
                }
                setCommandOpen(false);
              }}>
                <Keyboard className="mr-2 h-4 w-4" />
                <span>View All Sessions</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                const tabsElement = document.querySelector("[role='tablist']");
                if (tabsElement) {
                  const starredTab = tabsElement.querySelector("[data-state='inactive'][value='starred']");
                  if (starredTab) {
                    (starredTab as HTMLElement).click();
                    toast({
                      title: "Switched to Starred Sessions tab",
                      duration: 1000,
                    });
                  }
                }
                setCommandOpen(false);
              }}>
                <Keyboard className="mr-2 h-4 w-4" />
                <span>View Starred Sessions</span>
              </CommandItem>
            </CommandGroup>
          )}

          {pathname === "/playground" && (
            <CommandGroup heading="Playground">
              <CommandItem onSelect={() => {
                const mutateButton = document.querySelector("button:has(.lucide-zap)");
                if (mutateButton && !mutateButton.hasAttribute("disabled")) {
                  (mutateButton as HTMLElement).click();
                  toast({
                    title: "Generating mutations",
                    duration: 1000,
                  });
                } else {
                  toast({
                    title: "Cannot generate mutations",
                    description: "Check that you have a prompt and model selected",
                    variant: "destructive",
                    duration: 2000,
                  });
                }
                setCommandOpen(false);
              }}>
                <Zap className="mr-2 h-4 w-4" />
                <span>Generate Mutations</span>
                <CommandShortcut>⌘G</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => {
                const validateButton = document.querySelector("button:has(.lucide-bar-chart)");
                if (validateButton && !validateButton.hasAttribute("disabled")) {
                  (validateButton as HTMLElement).click();
                  toast({
                    title: "Validating mutations",
                    duration: 1000,
                  });
                } else {
                  toast({
                    title: "Cannot validate mutations",
                    description: "Select at least one mutation first",
                    variant: "destructive",
                    duration: 2000,
                  });
                }
                setCommandOpen(false);
              }}>
                <BarChart className="mr-2 h-4 w-4" />
                <span>Validate Selected Mutations</span>
                <CommandShortcut>⌘V</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => {
                const saveButton = document.querySelector("button:has(.lucide-save)");
                if (saveButton && !saveButton.hasAttribute("disabled")) {
                  (saveButton as HTMLElement).click();
                  toast({
                    title: "Session saved",
                    duration: 1000,
                  });
                } else {
                  toast({
                    title: "Cannot save session",
                    description: "Generate mutations first",
                    variant: "destructive",
                    duration: 2000,
                  });
                }
                setCommandOpen(false);
              }}>
                <Save className="mr-2 h-4 w-4" />
                <span>Save Session</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => {
                // Clear the prompt textarea
                const promptTextarea = document.querySelector("textarea#prompt");
                if (promptTextarea) {
                  (promptTextarea as HTMLTextAreaElement).value = "";
                  // Dispatch input event to trigger state update
                  const event = new Event('input', { bubbles: true });
                  promptTextarea.dispatchEvent(event);
                  toast({
                    title: "Prompt cleared",
                    duration: 1000,
                  });
                }
                setCommandOpen(false);
              }}>
                <X className="mr-2 h-4 w-4" />
                <span>Clear Prompt</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                const tabsElement = document.querySelector("[role='tablist']");
                if (tabsElement) {
                  const inactiveTab = tabsElement.querySelector("[data-state='inactive']");
                  if (inactiveTab) {
                    (inactiveTab as HTMLElement).click();
                    toast({
                      title: "Switched tab",
                      duration: 1000,
                    });
                  }
                }
                setCommandOpen(false);
              }}>
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>Switch Tab</span>
                <CommandShortcut>⌘T</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  )
}