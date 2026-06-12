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
      description,
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

  // Rendering fields block for defining a new role
  const renderRoleFormFields = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs font-bold text-zinc-400">
          Role Identifier
        </Label>
        <Input
          value={name}
          onChange={(e) =>
            setName(e.target.value.replace(/\s+/g, "_").toLowerCase())
          }
          placeholder="e.g. branch_manager"
          className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md h-12 font-mono text-black dark:text-white"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-zinc-400">
          Description
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What can this user do in the system?"
          className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md min-h-[100px] text-xs resize-none text-black dark:text-white"
        />
      </div>
      <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <Checkbox
          id="is_admin"
          checked={isAdmin}
          onCheckedChange={(v) => setIsAdmin(!!v)}
          className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
        />
        <Label
          htmlFor="is_admin"
          className="text-xs font-bold text-zinc-400 cursor-pointer"
        >
          Grant Super-Admin Privileges
        </Label>
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-bold text-zinc-400">
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
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold h-10 px-4 rounded-lg transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold h-10 px-6 rounded-lg transition-colors"
          >
            {editingRole ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      }
    >
      {editingRole ? (
        <div className="grid grid-cols-12 gap-8 h-[540px] min-h-[500px]">
          {/* Left Panel: Role settings and Persona list */}
          <div className="col-span-4 flex flex-col border-r border-zinc-200 dark:border-zinc-900 pr-6 h-full min-w-[240px]">
            {/* Role Config Section */}
            <div className="space-y-4 pb-5 shrink-0">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-500">
                  Role Identifier
                </Label>
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 px-3 h-10 rounded-lg select-none">
                  <span className={cn("size-2 rounded-full shrink-0", COLOR_BG[color])} />
                  {editingRole.name}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-500">
                  Description
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this user's capabilities..."
                  className="bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900 rounded-lg min-h-[72px] text-xs resize-none text-black dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-700"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 rounded-lg">
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
                  Super-Admin Privileges
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-500">Theme Marker</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        "size-5 rounded-full border-2 transition-all cursor-pointer",
                        color === c
                          ? "border-black dark:border-white scale-110 shadow-md"
                          : "border-transparent opacity-40 hover:opacity-100",
                        COLOR_BG[c],
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Persona List Section */}
            <div className="border-t border-zinc-200 dark:border-zinc-900 pt-4 flex-1 flex flex-col min-h-0">
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
          </div>

          {/* Right Panel: Selected Persona Details */}
          <div className="col-span-8 h-full flex flex-col min-h-0 pl-2">
            <PersonaDetails
              selectedInstance={selectedInstance || null}
              availableVariables={availableVariables}
              handleAddVariableValue={handleAddVariableValue}
              handleUpdateVariableValue={handleUpdateVariableValue}
              handleRemoveVariableValue={handleRemoveVariableValue}
            />
          </div>
        </div>
      ) : (
        renderRoleFormFields()
      )}
    </SlideInModal>
  );
}
