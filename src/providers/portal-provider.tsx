"use client";

import { PortalProvider } from './portal-context';

export default function PortalProviderWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <PortalProvider>{children}</PortalProvider>;
}
