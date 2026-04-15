import { Link, useLocation } from "@tanstack/react-router";
import { Calculator, FileText, Settings, LogOut, Shield, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { getCurrentRole, canEditSettings, canViewReports } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/train-data";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const role = getCurrentRole();

  const items = [
    { title: "Расчёт", url: "/", icon: Calculator, visible: true },
    { title: "Отчёты", url: "/reports", icon: FileText, visible: canViewReports() },
    { title: "Аналитика", url: "/analytics", icon: BarChart3, visible: role === "analyst" || role === "manager" },
    { title: "Настройки", url: "/settings", icon: Settings, visible: canEditSettings() },
  ].filter((i) => i.visible);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-lg">🚂</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">EcoPlan Hub</p>
              <p className="text-[10px] text-muted-foreground truncate">Планирование расходов</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</span>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                sessionStorage.removeItem("demo_auth");
                sessionStorage.removeItem("demo_role");
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Выйти</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
