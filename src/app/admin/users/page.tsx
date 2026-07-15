import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function AdminUsersPage() {
  const supabase = createClient(await cookies());
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Users</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u: any) => (
            <tr key={u.id}>
              <td style={{ fontWeight: 500 }}>{u.name}</td>
              <td>{u.email}</td>
              <td><span className={`status-badge`}>{u.role}</span></td>
              <td>{u.phone ?? "-"}</td>
              <td style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {new Date(u.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {(!users || users.length === 0) && (
            <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>No users yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
