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
  RiSettings3Line,
  RiLeafLine,
  RiLogoutBoxLine,
  RiMoneyDollarCircleLine,
} from "@remixicon/react";
import { usePathname } from "next/navigation";
import { createClientSupabaseClient } from "@/utils/supabase/client";

// Agent navigation data
const agentNavData = {
  teams: [
    {
      name: "Agent Portal",
      logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
    },
  ],
  navMain: [
    {
      title: "My Account",
      items: [
        {
          title: "Dashboard",
          url: "/agent",
          icon: RiScanLine,
        },
        {
          title: "My Transactions",
          url: "/agent/transactions",
          icon: RiBardLine,
        },
        {
          title: "My Clients",
          url: "/agent/clients",
          icon: RiUserFollowLine,
        },
        {
          title: "Commission",
          url: "/agent/commission",
          icon: RiMoneyDollarCircleLine,
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          title: "Profile Settings",
          url: "/agent/settings",
          icon: RiSettings3Line,
        },
        {
          title: "Help Center",
          url: "/agent/help",
          icon: RiLeafLine,
        },
      ],
    },
  ],
};

export function AgentSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [activePath, setActivePath] = React.useState(pathname || "");
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  React.useEffect(() => {
    setActivePath(pathname || "");
  }, [pathname]);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      const supabase = createClientSupabaseClient();
      await supabase.auth.signOut();
      // Redirect will be handled by auth middleware
    } catch (error) {
      console.error("Error signing out:", error);
      // In development mode, redirect to login page manually
      if (process.env.NODE_ENV === 'development') {
        window.location.href = '/';
      }
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={agentNavData.teams} isAdmin={true} />
        <hr className="border-t border-border mx-2 -mt-px" />
        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {agentNavData.navMain.map((group) => (
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