"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollaborators } from "@/hooks/useCollaborators";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Clock,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Undo2,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Invitation {
  email: string;
  status: "pending" | "accepted" | "rejected";
  role: "editor" | "viewer";
  timestamp: string;
}

interface RevokedLog {
  id: string;
  email: string;
  name: string;
  role: string;
  timestamp: string;
}

export function CollaboratorsView({ isModal = false }: { isModal?: boolean }) {
  const { id: projectId } = useParams();
  const {
    collaborators,
    invites,
    revokedLogs,
    isLoading,
    fetchCollaborators,
    fetchInvitations,
    fetchRevokedLogs,
    inviteCollaborator,
    removeCollaborator,
    updateRole,
    updatePermissions,
    removeInvitationLog,
    restoreRevokedAccess,
  } = useCollaborators();

  const [email, setEmail] = useState("");
  const [roleSelection, setRoleSelection] = useState<"editor" | "viewer">(
    "editor",
  );
  const [isInviting, setIsInviting] = useState(false);
  const [owner, setOwner] = useState<{
    id: string;
    user: { full_name: string | null; email: string };
    role: "owner";
  } | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchCollaborators(projectId as string);
      fetchInvitations(projectId as string);
      fetchRevokedLogs(projectId as string);
    }
  }, [projectId, fetchCollaborators, fetchInvitations, fetchRevokedLogs]);

  // Fetch the project owner directly from database projects and users tables
  useEffect(() => {
    async function fetchOwnerDetails() {
      if (!projectId) return;
      try {
        const supabase = createClient();
        // 1. Get owner_id from project
        const { data: projectData, error: projError } = await supabase
          .from("projects")
          .select("owner_id")
          .eq("id", projectId)
          .single();

        if (projError || !projectData?.owner_id) return;

        // 2. Fetch owner's user details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, full_name, email")
          .eq("id", projectData.owner_id)
          .single();

        if (!userError && userData) {
          setOwner({
            id: userData.id,
            user: {
              full_name: userData.full_name,
              email: userData.email,
            },
            role: "owner",
          });
        }
      } catch (err) {
        console.error("Failed to load project owner details:", err);
      }
    }

    fetchOwnerDetails();
  }, [projectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !projectId) return;
    setIsInviting(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      await inviteCollaborator(
        projectId as string,
        normalizedEmail,
        roleSelection,
      );
      setEmail("");
    } catch (err: any) {
      toast.error(`Invitation failed: ${err.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleDelete = async (collaborator: any) => {
    if (!projectId) return;
    try {
      await removeCollaborator(projectId as string, collaborator);
    } catch (err: any) {
      toast.error(`Revoke failed: ${err.message}`);
    }
  };

  const handlePermissionChange = async (
    collaborator: any,
    field: string,
    checked: boolean,
  ) => {
    if (!projectId) return;
    try {
      await updatePermissions(projectId as string, collaborator.id, {
        [field]: checked,
      });
    } catch (err: any) {
      toast.error(`Permission update failed: ${err.message}`);
    }
  };

  const removeInviteFromList = async (email: string) => {
    if (!projectId) return;
    await removeInvitationLog(projectId as string, email);
  };

  const handleRestoreRevokedAccess = async (log: RevokedLog) => {
    if (!projectId) return;
    setIsInviting(true);
    try {
      await restoreRevokedAccess(projectId as string, log);
    } catch (err: any) {
      toast.error(`Failed to restore: ${err.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <span className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-wider">
            Owner
          </span>
        );
      case "editor":
        return (
          <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
            Editor
          </span>
        );
      case "viewer":
        return (
          <span className="px-2 py-0.5 bg-zinc-50 dark:bg-black text-zinc-400 dark:text-zinc-600 text-[9px] font-black uppercase tracking-wider border border-zinc-100 dark:border-zinc-900">
            Viewer
          </span>
        );
      default:
        return null;
    }
  };

  // Combine fetched owner and fetched collaborators
  const activeMembersList = useMemo(() => {
    const list = [];
    if (owner) {
      list.push(owner);
    }
    // Filter out collaborator records that match owner user_id to prevent duplicates
    const members = collaborators.filter((c) => c.user_id !== owner?.id);
    list.push(...members);
    return list;
  }, [owner, collaborators]);

  return (
    <div
      className={cn(
        "bg-white dark:bg-black custom-scrollbar transition-colors duration-300 w-full",
        isModal ? "p-0 h-auto" : "h-full p-8 overflow-y-auto",
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          isModal ? "space-y-6 pb-2" : "space-y-10 pb-20",
        )}
      >
        {!isModal && (
          <header className="grid grid-cols-1 lg:grid-cols-2 justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900">
            <div className="space-y-2 col-span-1">
              <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white transition-colors">
                Collaborators
              </h1>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium transition-colors">
                Orchestrate team permissions and manage system access control.
              </p>
            </div>

            <form
              onSubmit={handleInvite}
              className="grid grid-cols-5 col-span-1 gap-2 w-full md:w-auto items-center"
            >
              <div className="relative flex-1 col-span-2 w-ful">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600 transition-colors" />
                <Input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md h-11 pl-10 text-xs focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-colors text-black dark:text-white"
                />
              </div>
              <select
                value={roleSelection}
                onChange={(e: any) => setRoleSelection(e.target.value)}
                className="bg-zinc-50 col-span-2 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 h-11 px-3 rounded-md focus:outline-none focus:border-zinc-400"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button
                type="submit"
                disabled={isInviting}
                className="bg-black col-span-1 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md h-11 px-6 text-xs font-black transition-colors"
              >
                {isInviting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
            </form>
          </header>
        )}

        {isModal && (
          <form
            onSubmit={handleInvite}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 w-full mb-6"
          >
            <div className="relative col-span-1 sm:col-span-7">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600 transition-colors" />
              <Input
                type="email"
                required
                placeholder="Enter collaborator email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md h-11 pl-10 text-xs focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-colors text-black dark:text-white w-full"
              />
            </div>
            <select
              value={roleSelection}
              onChange={(e: any) => setRoleSelection(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 h-11 px-3 rounded-md focus:outline-none focus:border-zinc-400 col-span-1 sm:col-span-3 w-full"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <Button
              type="submit"
              disabled={isInviting}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md h-11 px-6 text-xs font-black transition-colors col-span-1 sm:col-span-2 w-full shrink-0 flex items-center justify-center"
            >
              {isInviting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                "Invite"
              )}
            </Button>
          </form>
        )}

        {/* 1. Active Team Members Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <ShieldCheck className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 transition-colors">
              Active Team Members
            </h2>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black/40 overflow-hidden w-full">
            {isLoading && activeMembersList.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-400 dark:text-zinc-600">
                <Loader2 className="size-6 animate-spin" />
                <span className="text-xs font-bold font-mono">
                  Fetching active access registers...
                </span>
              </div>
            )}

            {activeMembersList.length === 0 && !isLoading && (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                <Users className="size-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-black text-zinc-400 dark:text-zinc-500">
                  No active team members registered.
                </p>
              </div>
            )}

            {activeMembersList.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all w-full"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1 md:max-w-xs">
                  <div className="size-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-600 dark:text-zinc-400 transition-colors select-none shrink-0">
                    {(user.user?.full_name || "A U")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-black dark:text-white transition-colors truncate">
                        {user.user?.full_name || "Anonymous User"}
                      </h4>
                      {user.role === "owner" ? getRoleBadge(user.role) : null}
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono transition-colors truncate">
                      {user.user?.email}
                    </p>
                  </div>
                </div>

                {/* Detailed Permissions Checkboxes */}
                {user.role !== "owner" && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-zinc-500 dark:text-zinc-400 py-2 md:py-0 border-y md:border-y-0 border-zinc-150 dark:border-zinc-900/50 flex-1">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={user.can_edit_pages ?? true}
                        onChange={(e) =>
                          handlePermissionChange(
                            user,
                            "can_edit_pages",
                            e.target.checked,
                          )
                        }
                        className="rounded-md border-zinc-300 dark:border-zinc-800 bg-transparent text-black dark:text-white focus:ring-0 focus:ring-offset-0 size-3 cursor-pointer"
                      />
                      Pages
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={user.can_edit_variables ?? true}
                        onChange={(e) =>
                          handlePermissionChange(
                            user,
                            "can_edit_variables",
                            e.target.checked,
                          )
                        }
                        className="rounded-md border-zinc-300 dark:border-zinc-800 bg-transparent text-black dark:text-white focus:ring-0 focus:ring-offset-0 size-3 cursor-pointer"
                      />
                      Variables
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={user.can_edit_constraints ?? true}
                        onChange={(e) =>
                          handlePermissionChange(
                            user,
                            "can_edit_constraints",
                            e.target.checked,
                          )
                        }
                        className="rounded-md border-zinc-300 dark:border-zinc-800 bg-transparent text-black dark:text-white focus:ring-0 focus:ring-offset-0 size-3 cursor-pointer"
                      />
                      Constraints
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={user.can_run_simulation ?? false}
                        onChange={(e) =>
                          handlePermissionChange(
                            user,
                            "can_run_simulation",
                            e.target.checked,
                          )
                        }
                        className="rounded-md border-zinc-300 dark:border-zinc-800 bg-transparent text-black dark:text-white focus:ring-0 focus:ring-offset-0 size-3 cursor-pointer"
                      />
                      Simulation
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={user.can_export ?? false}
                        onChange={(e) =>
                          handlePermissionChange(
                            user,
                            "can_export",
                            e.target.checked,
                          )
                        }
                        className="rounded-md border-zinc-300 dark:border-zinc-800 bg-transparent text-black dark:text-white focus:ring-0 focus:ring-offset-0 size-3 cursor-pointer"
                      />
                      Export
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={user.can_invite_others ?? false}
                        onChange={(e) =>
                          handlePermissionChange(
                            user,
                            "can_invite_others",
                            e.target.checked,
                          )
                        }
                        className="rounded-md border-zinc-300 dark:border-zinc-800 bg-transparent text-black dark:text-white focus:ring-0 focus:ring-offset-0 size-3 cursor-pointer"
                      />
                      Invite
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-4 shrink-0 justify-end">
                  {user.role !== "owner" ? (
                    <>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateRole(
                            projectId as string,
                            user.id,
                            e.target.value,
                          )
                        }
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 h-8 px-2 rounded-md focus:outline-none focus:border-zinc-400 cursor-pointer animate-fade-in"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      <Button
                        onClick={() => handleDelete(user)}
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-md border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-950 transition-all opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100"
                        title="Revoke collaborator access"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-[124px]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Sent Invitations Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <Clock className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 transition-colors">
              Sent Invitations
            </h2>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black/40 overflow-hidden w-full">
            {invites.length === 0 && (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-1">
                <p className="text-sm font-black text-zinc-400 dark:text-zinc-500">
                  No pending or archived invites.
                </p>
              </div>
            )}

            {invites.map((invite) => (
              <div
                key={invite.email}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all w-full"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-mono text-zinc-600 dark:text-zinc-300 transition-colors truncate">
                      {invite.email}
                    </h4>
                    <div className="flex items-center gap-2 text-[9px] text-zinc-400">
                      <span>
                        Role:{" "}
                        <strong className="uppercase">{invite.role}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Sent {new Date(invite.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
                  {/* Status Indicator */}
                  {invite.status === "pending" && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[9px] font-black uppercase tracking-wider animate-pulse">
                      Pending Invite
                    </span>
                  )}
                  {invite.status === "accepted" && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                      Accepted
                    </span>
                  )}
                  {invite.status === "rejected" && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 border border-red-500/20 bg-red-500/5 text-red-400 text-[9px] font-black uppercase tracking-wider">
                      Rejected
                    </span>
                  )}

                  {/* Cancel / Delete Invitation Button */}
                  <div className="flex items-center gap-1 opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100 transition-opacity">
                    <Button
                      onClick={() => removeInviteFromList(invite.email)}
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-red-950/20 hover:text-red-500 transition-all"
                      title={
                        invite.status === "pending"
                          ? "Cancel Invitation"
                          : "Delete Invitation Log"
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Revoked Access History Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <ShieldAlert className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 transition-colors">
              Revoked Access
            </h2>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black/40 overflow-hidden w-full">
            {revokedLogs.length === 0 && (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-1">
                <p className="text-sm font-black text-zinc-400 dark:text-zinc-500">
                  No revoked access logs.
                </p>
              </div>
            )}

            {revokedLogs.map((log) => (
              <div
                key={log.email}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all w-full"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-10 bg-zinc-100/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
                    <Trash2 className="size-4 text-red-500/70" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 transition-colors truncate">
                        {log.name}
                      </h4>
                      <span className="px-1.5 py-0.2 border border-red-500/20 text-red-500 text-[8px] font-black uppercase bg-red-500/5 whitespace-nowrap">
                        Access Revoked
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono transition-colors truncate">
                      {log.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between sm:justify-end gap-4 shrink-0 w-full sm:w-auto">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-650 font-medium whitespace-nowrap">
                    Revoked {new Date(log.timestamp).toLocaleDateString()}
                  </span>

                  <Button
                    onClick={() => handleRestoreRevokedAccess(log)}
                    size="sm"
                    className="h-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-[10px] font-black uppercase text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1.5 px-3 shrink-0"
                  >
                    <Undo2 className="size-3" />
                    Restore Access
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
