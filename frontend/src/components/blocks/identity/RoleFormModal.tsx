"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SlideInModal } from "@/components/ui/SlideInModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PersonaList } from "./PersonaList";
import { PersonaDetails } from "./PersonaDetails";

const COLORS = [
  "zinc",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
] as const;

const COLOR_BG: Record<string, string> = {
  zinc: "bg-zinc-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
};

interface PersonaInstance {
  id: string;
  name: string;
  values: Record<string, any>;
}

interface Props {
  isOpen: boolean;
  editingRole: any | null;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  availableVariables: any[];
}

export function RoleFormModal({
  isOpen,
  editingRole,
  onClose,
  onSave,
  availableVariables,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [color, setColor] = useState<typeof COLORS[number]>("zinc");

  // Persona State
  const [instances, setInstances] = useState<PersonaInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [newInstanceName, setNewInstanceName] = useState("");
  const [isAddingInstance, setIsAddingInstance] = useState(false);
  const [editingInstanceNameId, setEditingInstanceNameId] = useState<string | null>(null);
  const [tempInstanceName, setTempInstanceName] = useState("");

  // Sync state with editing role when it opens
  useEffect(() => {
    if (editingRole) {
      setName(editingRole.name || "");
      setDescription(editingRole.description || "");
      setIsAdmin(editingRole.is_admin || false);
      setColor(editingRole.color || "zinc");

      if (editingRole.persona?.instances) {
        setInstances(editingRole.persona.instances);
        if (editingRole.persona.instances.length > 0) {
          setSelectedInstanceId(editingRole.persona.instances[0].id);
        } else {
          setSelectedInstanceId(null);
        }
      } else {
        setInstances([]);
        setSelectedInstanceId(null);
      }
    } else {
      setName("");
      setDescription("");
      setIsAdmin(false);
      setColor("zinc");
      setInstances([]);
      setSelectedInstanceId(null);
    }
  }, [editingRole, isOpen]);

  const selectedInstance = instances.find((inst) => inst.id === selectedInstanceId);

  const handleAddInstance = () => {
    const instanceName = newInstanceName.trim();
    if (!instanceName) {
      toast.error("Instance name is required");
      return;
    }
    const newId = `inst_${Math.random().toString(36).substring(7)}`;
    const newInst: PersonaInstance = {
      id: newId,
      name: instanceName,
      values: {},
    };
    const updated = [...instances, newInst];
    setInstances(updated);
    setSelectedInstanceId(newId);
    setNewInstanceName("");
    setIsAddingInstance(false);
    toast.success(`Instance "${instanceName}" created`);
  };

  const handleDeleteInstance = (id: string) => {
    const updated = instances.filter((inst) => inst.id !== id);
    setInstances(updated);
    if (selectedInstanceId === id) {
      setSelectedInstanceId(updated[0]?.id || null);
    }
    toast.success("Instance removed");
  };

  const handleUpdateInstanceName = (id: string) => {
    const instanceName = tempInstanceName.trim();
    if (!instanceName) return;
    const updated = instances.map((inst) =>
      inst.id === id ? { ...inst, name: instanceName } : inst
    );
    setInstances(updated);
    setEditingInstanceNameId(null);
    toast.success("Instance name updated");
  };

  const handleAddVariableValue = (varId: string) => {
    if (!selectedInstanceId || !selectedInstance) return;
    const variable = availableVariables.find((v) => v.id === varId);
    if (!variable) return;

    if (selectedInstance.values[variable.label] !== undefined) {
      toast.warning("Variable already bound to this instance");
      return;
    }

    let defaultVal: any = "";
    if (variable.type === "boolean") defaultVal = false;
    else if (variable.type === "number") defaultVal = 0;
    else if (variable.type === "object" || variable.type === "array") defaultVal = {};

    const updatedValues = { ...selectedInstance.values, [variable.label]: defaultVal };
    const updated = instances.map((inst) =>
      inst.id === selectedInstanceId ? { ...inst, values: updatedValues } : inst
    );
    setInstances(updated);
  };

  const handleUpdateVariableValue = (varLabel: string, val: any) => {
    if (!selectedInstanceId || !selectedInstance) return;
    const updatedValues = { ...selectedInstance.values, [varLabel]: val };
    const updated = instances.map((inst) =>
      inst.id === selectedInstanceId ? { ...inst, values: updatedValues } : inst
    );
    setInstances(updated);
  };

  const handleRemoveVariableValue = (varLabel: string) => {
    if (!selectedInstanceId || !selectedInstance) return;
    const updatedValues = { ...selectedInstance.values };
    delete updatedValues[varLabel];
    const updated = instances.map((inst) =>
      inst.id === selectedInstanceId ? { ...inst, values: updatedValues } : inst
    );
    setInstances(updated);
  };

  const handleSave = async () => {
    const finalName = editingRole ? editingRole.name : name;
    if (!finalName) {
      toast.error("Role identifier is required.");
      return;
    }

    const payload: any = {
      name: finalName,
      description: editingRole ? editingRole.description : description,
      is_admin: isAdmin,
      color,
    };

    if (editingRole) {
      payload.persona = {
        ...editingRole.persona,
        instances,
      };
    }

    await onSave(payload);
    onClose();
  };

  // Rendering fields block
  const renderRoleFormFields = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[10px] font-black text-zinc-400">
          Role Identifier
        </Label>
        <Input
          value={editingRole ? editingRole.name : name}
          disabled={!!editingRole}
          onChange={(e) =>
            setName(e.target.value.replace(/\s+/g, "_").toLowerCase())
          }
          placeholder="e.g. branch_manager"
          className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md h-12 font-mono text-black dark:text-white"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black text-zinc-400">
          Description
        </Label>
        <Textarea
          value={editingRole ? editingRole.description : description}
          onChange={(e) =>
            editingRole ? null : setDescription(e.target.value)
          }
          placeholder="What can this user do in the system?"
          className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md min-h-[100px] text-xs resize-none text-black dark:text-white"
        />
      </div>
      <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800">
        <Checkbox
          id="is_admin"
          checked={isAdmin}
          onCheckedChange={(v) => setIsAdmin(!!v)}
          className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
        />
        <Label
          htmlFor="is_admin"
          className="text-[10px] font-black text-zinc-400 cursor-pointer"
        >
          Grant Super-Admin Privileges
        </Label>
      </div>
      <div className="space-y-3">
        <Label className="text-[10px] font-black text-zinc-400">
          Theme Marker
        </Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "size-8 rounded-full border-2 transition-all cursor-pointer",
                color === c
                  ? "border-black dark:border-white scale-110 shadow-lg"
                  : "border-transparent opacity-50 hover:opacity-100",
                COLOR_BG[c],
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <SlideInModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRole ? "Modify User Role" : "Define User Role"}
      description={
        editingRole
          ? "Update archetype parameters, permissions, and define behavioral persona instances."
          : "Establish a new user archetype and their global permissions."
      }
      size={editingRole ? "3xl" : "md"}
      footer={
        <Button
          onClick={handleSave}
          className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md h-12 text-xs font-semibold"
        >
          {editingRole ? "Save Changes" : "Create Role"}
        </Button>
      }
    >
      {editingRole ? (
        <div className="space-y-6 pb-6">
          {/* Top Section: Role Definition */}
          <div className="bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-900">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">User Role Settings</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Identifiers */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-500">
                    Role Identifier
                  </Label>
                  <Input
                    value={editingRole ? editingRole.name : name}
                    disabled={!!editingRole}
                    className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md h-10 font-mono text-xs text-black dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <Checkbox
                    id="is_admin"
                    checked={isAdmin}
                    onCheckedChange={(v) => setIsAdmin(!!v)}
                    className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                  />
                  <Label
                    htmlFor="is_admin"
                    className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer select-none"
                  >
                    Grant Super-Admin Privileges
                  </Label>
                </div>
              </div>

              {/* Right Side: Description */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-zinc-500">
                  Description
                </Label>
                <Textarea
                  value={editingRole ? editingRole.description : description}
                  onChange={(e) =>
                    editingRole ? null : setDescription(e.target.value)
                  }
                  placeholder="Describe this user's capabilities..."
                  className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md min-h-[80px] text-xs resize-none text-black dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-900/50">
              <Label className="text-[10px] font-bold text-zinc-500">Theme Marker</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-6 rounded-full border-2 transition-all cursor-pointer",
                      color === c
                        ? "border-black dark:border-white scale-110 shadow-lg"
                        : "border-transparent opacity-40 hover:opacity-100",
                      COLOR_BG[c],
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Persona Simulation */}
          <div className="bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-900">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">Behavioral Simulation Personas</span>
            </div>

            <div className="grid grid-cols-3 gap-6 h-[380px]">
              {/* Left Side: Persona List */}
              <div className="col-span-1 border-r border-zinc-200 dark:border-zinc-900 pr-5 h-full overflow-y-auto custom-scrollbar">
                <PersonaList
                  instances={instances}
                  selectedInstanceId={selectedInstanceId}
                  setSelectedInstanceId={setSelectedInstanceId}
                  isAddingInstance={isAddingInstance}
                  setIsAddingInstance={setIsAddingInstance}
                  newInstanceName={newInstanceName}
                  setNewInstanceName={setNewInstanceName}
                  handleAddInstance={handleAddInstance}
                  editingInstanceNameId={editingInstanceNameId}
                  setEditingInstanceNameId={setEditingInstanceNameId}
                  tempInstanceName={tempInstanceName}
                  setTempInstanceName={setTempInstanceName}
                  handleUpdateInstanceName={handleUpdateInstanceName}
                  handleDeleteInstance={handleDeleteInstance}
                  roleColor={color}
                />
              </div>

              {/* Right Side: Variable Mocks */}
              <div className="col-span-2 h-full pl-2 overflow-y-auto custom-scrollbar">
                <PersonaDetails
                  selectedInstance={selectedInstance || null}
                  availableVariables={availableVariables}
                  handleAddVariableValue={handleAddVariableValue}
                  handleUpdateVariableValue={handleUpdateVariableValue}
                  handleRemoveVariableValue={handleRemoveVariableValue}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        renderRoleFormFields()
      )}
    </SlideInModal>
  );
}
