import {
  ChevronDown,
  ChevronRight,
  Plus,
  Folder,
  FileText,
  Layers,
  ShieldAlert,
  Lightbulb,
  Settings,
  Trash2,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Search,
} from "lucide-react";

import { useState } from "react";


function Sidebar({
  projects,
  onCreateProject,
  selectedProject,
  setSelectedProject,
  onNavigate,
  activeView,
  onSettingsClick,
  collapsed,
  onToggleCollapse,
}) {

  const [openProjects, setOpenProjects] = useState({});

  const toggleProject = (id) => {
    setOpenProjects((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Collapsed rail — a slim strip with just an expand affordance (Notion style).
  if (collapsed) {
    return (
      <aside
        className="w-12 h-screen flex flex-col items-center py-3 gap-2 border-r flex-shrink-0"
        style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--hairline)" }}
      >
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: "var(--ink-subtle)" }}
        >
          <PanelLeft size={18} />
        </button>
        <button
          onClick={onCreateProject}
          title="New project"
          className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: "var(--ink-subtle)" }}
        >
          <Plus size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="w-[264px] h-screen flex flex-col border-r flex-shrink-0"
      style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--hairline)" }}
    >

      {/* Workspace / Profile header */}
      <div className="p-2">
        <div className="group flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors hover:bg-[var(--surface-2)]">
          <button className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)" }}
            >
              H
            </div>
            <span className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
              Harshavardhan
            </span>
            <ChevronDown size={14} style={{ color: "var(--ink-subtle)" }} className="flex-shrink-0" />
          </button>

          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--surface-3)]"
            style={{ color: "var(--ink-subtle)" }}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Search affordance */}
        <button
          className="mt-1 flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: "var(--ink-subtle)" }}
        >
          <Search size={15} />
          <span>Search</span>
        </button>
      </div>

      {/* Projects Area */}
      <div className="px-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-1 mt-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Projects
          </span>
          <button
            onClick={onCreateProject}
            title="New project"
            className="rounded p-0.5 transition-colors hover:bg-[var(--surface-3)]"
            style={{ color: "var(--ink-subtle)" }}
          >
            <Plus size={15} />
          </button>
        </div>

        {projects.length === 0 && (
          <p className="px-2 py-2 text-xs leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
            No projects yet. Click + to create one.
          </p>
        )}

        <div className="space-y-0.5">
          {projects.map((project) => {
            const isSelected = selectedProject?.id === project.id;
            const isOpen = openProjects[project.id];

            return (
              <div key={project.id}>
                <button
                  onClick={() => {
                    toggleProject(project.id);
                    setSelectedProject(project);
                  }}
                  className="group flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    backgroundColor: isSelected ? "var(--surface-3)" : "transparent",
                    color: isSelected ? "var(--ink)" : "var(--ink-muted)",
                    fontWeight: isSelected ? 500 : 400,
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "var(--surface-2)"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span className="flex-shrink-0" style={{ color: "var(--ink-subtle)" }}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <Folder size={15} className="flex-shrink-0" style={{ color: "var(--ink-subtle)" }} />
                  <span className="truncate">{project.name}</span>
                </button>

                {isOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 pl-2 border-l" style={{ borderColor: "var(--hairline)" }}>
                    <ProjectItem
                      icon={<Layers size={14} />}
                      name="Modules"
                      active={isSelected && activeView === "modules"}
                      onClick={() => { setSelectedProject(project); onNavigate("modules"); }}
                    />
                    <ProjectItem
                      icon={<Lightbulb size={14} />}
                      name="Assumptions"
                      active={isSelected && activeView === "assumptions"}
                      onClick={() => { setSelectedProject(project); onNavigate("assumptions"); }}
                    />
                    <ProjectItem
                      icon={<ShieldAlert size={14} />}
                      name="Risks"
                      active={isSelected && activeView === "risks"}
                      onClick={() => { setSelectedProject(project); onNavigate("risks"); }}
                    />
                    <ProjectItem
                      icon={<FileText size={14} />}
                      name="Review & Export"
                      active={isSelected && activeView === "review"}
                      onClick={() => { setSelectedProject(project); onNavigate("review"); }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-2 pb-3 pt-2 space-y-0.5 border-t" style={{ borderColor: "var(--hairline)" }}>
        <SidebarItem icon={<Settings size={15} />} name="Settings" onClick={onSettingsClick} />
        <SidebarItem icon={<HelpCircle size={15} />} name="Help" />
        <SidebarItem icon={<Trash2 size={15} />} name="Trash" />
      </div>
    </aside>
  );
}


function ProjectItem({ icon, name, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors"
      style={{
        backgroundColor: active ? "var(--primary-soft)" : "transparent",
        color: active ? "var(--primary)" : "var(--ink-subtle)",
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "var(--surface-2)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <span className="flex-shrink-0">{icon}</span>
      {name}
    </button>
  );
}


function SidebarItem({ icon, name, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors"
      style={{ color: "var(--ink-subtle)" }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface-2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <span className="flex-shrink-0">{icon}</span>
      {name}
    </button>
  );
}


export default Sidebar;
