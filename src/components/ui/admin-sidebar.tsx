"use client";

import * as React from "react";
import Link from "next/link";
import { SearchForm } from "@/components/ui/search-form";
import { TeamSwitcher } from "@/components/ui/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarProvider,
} from "@/components/reusable-ui/sidebar";
import {
  RiScanLine,
  RiBardLine,
  RiUserFollowLine,
  RiCodeSSlashLine,
  RiLoginCircleLine,
  RiLayoutLeftLine,
  RiSettings3Line,
  RiLeafLine,
  RiLogoutBoxLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import { useRouter, usePathname } from "next/navigation";
import { createClientSupabaseClient } from "@/utils/supabase/client";

// Admin navigation data with updated structure
const adminNavData = {
  teams: [
    {
      name: "Admin Portal",
      logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
    },
  ],
  navMain: [
    {
      title: "Sections",
      items: [
        {
          title: "Dashboard",
          url: "/admin-dashboard",
          icon: RiScanLine,
        },
        {
          title: "Transactions",
          url: "/admin-dashboard/transactions",
          icon: RiBardLine,
        },
        {
          title: "Agent Management",
          icon: RiUserFollowLine,
          hasSubItems: true,
          subItems: [
            {
              title: "Agents",
              url: "/agents",
            },
            {
              title: "Teams",
              url: "/teams",
            }
          ]
        }
        // The items have been completely removed, not just commented out
      ],
    },
    {
      title: "Other",
      items: [
        {
          title: "Settings",
          url: "/admin/settings",
          icon: RiSettings3Line,
        },
        {
          title: "Help Center",
          url: "/admin/help",
          icon: RiLeafLine,
        },
      ],
    },
  ],
};

// Export the AdminSidebar component so it can be imported elsewhere
export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const [activePath, setActivePath] = React.useState(pathname || "");
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setActivePath(pathname || "");

    // Auto-expand menus based on current path
    const newExpandedState = {...expandedMenus};

    // Check if we should expand the Agent Management section
    adminNavData.navMain.forEach(group => {
      group.items.forEach(item => {
        if (item.hasSubItems && item.subItems) {
          const shouldExpand = item.subItems.some(subItem =>
            pathname === subItem.url || pathname.startsWith(subItem.url)
          );
          if (shouldExpand) {
            newExpandedState[item.title] = true;
          }
        }
      });
    });

    setExpandedMenus(newExpandedState);
  }, [pathname]);

  const toggleSubmenu = (menuTitle: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }));
  };

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      const supabase = createClientSupabaseClient();
      await supabase.auth.signOut();
      router.push("/"); // Redirect to root (login page)
    } catch (error) {
      console.error("Error signing out:", error);
      // Fallback for development mode
      if (process.env.NODE_ENV === 'development') {
        window.location.href = '/';
      }
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Sidebar {...props} className="border-r border-border">
      <SidebarHeader>
        <TeamSwitcher teams={adminNavData.teams} isAdmin={true} />
        <hr className="border-t border-border mx-2 -mt-px" />
        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {adminNavData.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/60">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {group.items.map((item) => {
                  // For items with subitems (like Agent Management)
                  if (item.hasSubItems && item.subItems) {
                    const isExpanded = expandedMenus[item.title] || false;
                    const hasActiveSubItem = item.subItems.some(subItem =>
                      activePath === subItem.url ||
                      (subItem.url !== "/" && activePath.startsWith(subItem.url))
                    );

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                          isActive={hasActiveSubItem}
                          onClick={() => toggleSubmenu(item.title)}
                        >
                          {item.icon && (
                            <item.icon
                              className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                              size={22}
                              aria-hidden="true"
                            />
                          )}
                          <span>{item.title}</span>
                          <RiArrowDownSLine
                            className={`ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            size={18}
                          />
                        </SidebarMenuButton>

                        {isExpanded && (
                          <SidebarMenuSub>
                            {item.subItems.map(subItem => {
                              const isSubItemActive = activePath === subItem.url ||
                                (subItem.url !== "/" && activePath.startsWith(subItem.url));

                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubItemActive}
                                  >
                                    <Link href={subItem.url} prefetch={true}>
                                      {subItem.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  }

                  // For regular items without subitems
                  const isActive = item.url ? (
                    activePath === item.url ||
                    (item.url !== "/" && activePath.startsWith(item.url))
                  ) : false;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                        isActive={isActive}
                      >
                        <Link href={item.url || "#"} prefetch={true}>
                          {item.icon && (
                            <item.icon
                              className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                              size={22}
                              aria-hidden="true"
                            />
                          )}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <RiLogoutBoxLine
                className="text-muted-foreground/60"
                size={22}
                aria-hidden="true"
              />
              <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// Export a wrapped version that includes the SidebarProvider
export function AdminSidebarWrapper(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar {...props} />
    </SidebarProvider>
  );
}


