"use client"

import {
  FileText,
  Info,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

interface AdminSidebarProps {
  active: string
  onChangeActive: (active: string) => void
  mobileMenu: boolean
  onChangeMobileMenu: (open: boolean) => void
}



const sidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "User Management", icon: Users },
  { name: "Reports", icon: FileText },
  { name: "Moderation", icon: ShieldCheck },
  { name: "Settings", icon: Settings },
];

export default function AdminSidebar({
  active,
  onChangeActive,
  mobileMenu,
  onChangeMobileMenu,
}: AdminSidebarProps) {
  return (
    <div>
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col p-4 border-r border-border bg-black/30 backdrop-blur-xl">
        <h1 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
          Admin Command
        </h1>
        <nav className="space-y-2 flex-1">
          {sidebarItems.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              onClick={() => onChangeActive(name)}
              variant={active === name ? "default" : "ghost"}
              className={`w-full justify-start ${
                active === name
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5 mr-2" /> {name}
            </Button>
          ))}
        </nav>
        {/* Info card bottom */}
        <Card className="mt-4 border border-border bg-black/40 backdrop-blur-xl">
          <CardContent className="p-3 flex items-center gap-3">
            <Info className="w-4 h-4 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              Quantum Wager v1.2
              <br /> All systems normal
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Sidebar (mobile via sheet) */}
      <Sheet open={mobileMenu} onOpenChange={onChangeMobileMenu}>
        <SheetContent side="left" className="w-64 bg-black/30 backdrop-blur-xl">
          <SheetHeader>
            <SheetTitle className="bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
              Admin Command
            </SheetTitle>
          </SheetHeader>
          <nav className="space-y-2 mt-6">
            {sidebarItems.map(({ name, icon: Icon }) => (
              <Button
                key={name}
                onClick={() => {
                  onChangeActive(name);
                  onChangeMobileMenu(false);
                }}
                variant={active === name ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="w-5 h-5 mr-2" /> {name}
              </Button>
            ))}
          </nav>
          <Card className="mt-6 border border-border bg-black/40 backdrop-blur-xl">
            <CardContent className="p-3 flex items-center gap-3">
              <Info className="w-4 h-4 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                Quantum Wager v1.2
                <br /> All systems normal
              </div>
            </CardContent>
          </Card>
        </SheetContent>
      </Sheet>
    </div>
  );
}
