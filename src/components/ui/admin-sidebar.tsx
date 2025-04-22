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
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Admin navigation data
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
          url: "/transactions",
          icon: RiBardLine,
        },
        {
          title: "Agents",
          url: "/agents",
          icon: RiUserFollowLine,
        },
        {
          title: "Tools",
          url: "/admin/tools",
          icon: RiCodeSSlashLine,
        },
        {
          title: "Integration",
          url: "/admin/integration",
          icon: RiLoginCircleLine,
        },
        {
          title: "Layouts",
          url: "/admin/layouts",
          icon: RiLayoutLeftLine,
        },
        {
          title: "Reports",
          url: "/admin/reports",
          icon: RiLeafLine,
        },
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

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const [activePath, setActivePath] = React.useState(pathname || "");
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  
  React.useEffect(() => {
    setActivePath(pathname || "");
    console.log("Current pathname:", pathname); // Debug current path
  }, [pathname]);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      const supabase = createClientComponentClient();
      await supabase.auth.signOut();
      router.push("/login"); // Explicitly redirect to login
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  }

  // Debug function to check if sidebar is rendering
  React.useEffect(() => {
    console.log("AdminSidebar rendered");
  }, []);

  return (
    <Sidebar {...props} className="border-r border-border">
      <SidebarHeader>
        <TeamSwitcher teams={adminNavData.teams} />
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
                  // Check if the current path exactly matches the item URL or starts with it
                  const isActive = activePath === item.url || 
                    (item.url !== "/" && activePath.startsWith(item.url));
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                        isActive={isActive}
                      >
                        <Link href={item.url} prefetch={true}>
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