"use client";

import { AdminTableView } from "@/components/admin/admin-table-view";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
}

export function AdminUsersClient({ users }: { users: User[] }) {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users</h1>
      </div>

      <AdminTableView
        data={users}
        searchKeys={["name", "email", "phone"]}
        emptyMessage="No users yet"
        columns={[
          { key: "name", label: "Name", render: (u) => <strong>{u.name}</strong> },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (u) => <span className={`status-badge ${u.role === "admin" ? "active" : u.role === "provider" ? "accepted" : ""}`}>{u.role}</span> },
          { key: "phone", label: "Phone", hideOnMobile: true, render: (u) => u.phone ?? "—" },
          { key: "created_at", label: "Joined", hideOnMobile: true, render: (u) => new Date(u.created_at).toLocaleDateString() },
        ]}
        renderGridCard={(u) => (
          <div className="admin-card-content">
            <div className="admin-card-header">
              <strong>{u.name}</strong>
              <span className={`status-badge ${u.role === "admin" ? "active" : u.role === "provider" ? "accepted" : ""}`}>{u.role}</span>
            </div>
            <div className="admin-card-meta">{u.email}</div>
          </div>
        )}
      />
    </div>
  );
}
