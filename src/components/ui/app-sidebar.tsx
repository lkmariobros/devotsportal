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
  SidebarRail,
} from "@/components/ui/sidebar";
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
} from "@remixicon/react";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// App navigation data
const appNavData = {
  teams: [
    {
      name: "App Portal",
      logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
    },
  ],
  navMain: [
    {
      title: "Sections",
      items: [
        {
          title: "Dashboard",
          url: "/app/dashboard",
          icon: RiScanLine,
        },
        {
          title: "Insights",
          url: "/app/insights",
          icon: RiBardLine,
        },
        {
          title: "Contacts",
          url: "/app/contacts",
          icon: RiUserFollowLine,
        },
        {
          title: "Tools",
          url: "/app/tools",
          icon: RiCodeSSlashLine,
        },
        {
          title: "Integration",
          url: "/app/integration",
          icon: RiLoginCircleLine,
        },
        {
          title: "Layouts",
          url: "/app/layouts",
          icon: RiLayoutLeftLine,
        },
        {
          title: "Reports",
          url: "/app/reports",
          icon: RiLeafLine,
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          title: "Settings",
          url: "/app/settings",
          icon: RiSettings3Line,
        },
        {
          title: "Help Center",
          url: "/app/help",
          icon: RiLeafLine,
        },
      ],
    },
  ],
};

export function AppSidebar({ isAdmin = false, ...props }: React.ComponentProps<typeof Sidebar> & { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [activePath, setActivePath] = React.useState(pathname || "");
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const isInAdminSection = pathname.includes('/admin') || pathname.startsWith('/admin-dashboard');
  
  React.useEffect(() => {
    setActivePath(pathname || "");
  }, [pathname]);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      const supabase = createClientComponentClient();
      await supabase.auth.signOut();
      // Redirect will be handled by auth middleware
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={appNavData.teams} isAdmin={isAdmin || isInAdminSection} />
        <hr className="border-t border-border mx-2 -mt-px" />
        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {appNavData.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/60">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = activePath === item.url || 
                    (item.url !== "/" && activePath.startsWith(item.url));
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                        isActive={isActive}
                      >
                        <Link href={item.url}>
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