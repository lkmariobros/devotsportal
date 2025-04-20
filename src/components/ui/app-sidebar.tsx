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

// This is sample data.
const data = {
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
          url: "/admin/dashboard",
          icon: RiScanLine,
        },
        {
          title: "Insights",
          url: "/admin/insights",
          icon: RiBardLine,
        },
        {
          title: "Contacts",
          url: "/admin/contacts",
          icon: RiUserFollowLine,
          isActive: true,
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = false, ...props }: AppSidebarProps) {
  // Get current path to determine active item
  const [activePath, setActivePath] = React.useState("");
  
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname);
    }
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} isAdmin={isAdmin} />
        <hr className="border-t border-border mx-2 -mt-px" />
        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((group) => (
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
              asChild
              className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
            >
              <Link href="/auth/signout">
                <RiLogoutBoxLine
                  className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                  size={22}
                  aria-hidden="true"
                />
                <span>Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}