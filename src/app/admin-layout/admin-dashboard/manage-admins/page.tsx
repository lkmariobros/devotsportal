"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  // Fetch current admins
  useEffect(() => {
    async function fetchAdmins() {
      try {
        setIsLoadingAdmins(true);
        const response = await fetch("/api/admin/manage");
        const data = await response.json();
        
        if (data.admins) {
          setAdmins(data.admins);
        } else if (data.error) {
          toast.error(data.error);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
        toast.error("Failed to load admin users");
      } finally {
        setIsLoadingAdmins(false);
      }
    }

    fetchAdmins();
  }, []);

  // Add new admin
  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdminEmail) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newAdminEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Admin added successfully");
        setNewAdminEmail("");
        
        // Refresh admin list
        const refreshResponse = await fetch("/api/admin/manage");
        const refreshData = await refreshResponse.json();
        if (refreshData.admins) {
          setAdmins(refreshData.admins);
        }
      } else {
        toast.error(data.error || "Failed to add admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Admins</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="flex space-x-2">
            <Input
              type="email"
              placeholder="Email address"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Admins</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAdmins ? (
            <div className="text-center py-4">Loading admins...</div>
          ) : (
            <div className="space-y-4">
              {admins.length === 0 ? (
                <p className="text-muted-foreground">No admins found</p>
              ) : (
                admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{admin.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Added on {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
