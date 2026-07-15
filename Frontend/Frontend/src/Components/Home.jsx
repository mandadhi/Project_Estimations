import { useState } from "react";

import HomeContent from "./HomeContent";
import Modules from "./Modules";
import Assumptions from "./Assumptions";
import Risks from "./Risks";
import ReviewDocument from "./ReviewDocument";

import Sidebar from "./Sidebar";
import CreateProject from "./CreateProjectDialog";
import Settings from "./Settings";
import ThemeToggle from "./ThemeToggle";

import { PanelLeft } from "lucide-react";


const VIEW_LABELS = {
  home: "Chat",
  modules: "Modules",
  assumptions: "Assumptions",
  risks: "Risks",
  review: "Review & Export",
};


function Home() {

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  // Lifted modules state — shared between HomeContent and Modules views
  const [modules, setModules] = useState([]);


  const createProject = (project) => {
    setProjects((prev) => [...prev, project]);
    setSelectedProject(project);
    setShowCreate(false);
    setActiveView("home");
    setModules([]);
  };


  const handleModulesUpdate = (newModules) => {
    setModules(newModules);
  };


  const renderContent = () => {
    if (!selectedProject) {
      return <HomeContent onCreateProject={() => setShowCreate(true)} />;
    }

    switch (activeView) {
      case "modules":
        return (
          <Modules
            selectedProject={selectedProject}
            modules={modules}
            setModules={setModules}
          />
        );

      case "assumptions":
        return <Assumptions selectedProject={selectedProject} />;

      case "risks":
        return <Risks selectedProject={selectedProject} />;

      case "review":
        return <ReviewDocument selectedProject={selectedProject} />;

      default:
        return (
          <HomeContent
            selectedProject={selectedProject}
            onCreateProject={() => setShowCreate(true)}
            onModulesUpdate={handleModulesUpdate}
          />
        );
    }
  };


  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--canvas)" }}>

      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={(project) => {
          setSelectedProject(project);
          setActiveView("home");
        }}
        onCreateProject={() => setShowCreate(true)}
        activeView={activeView}
        onNavigate={setActiveView}
        onSettingsClick={() => setShowSettings(true)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header
          className="h-12 flex items-center gap-3 px-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--hairline)", backgroundColor: "var(--canvas)" }}
        >
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="h-7 w-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--surface-2)]"
              style={{ color: "var(--ink-subtle)" }}
            >
              <PanelLeft size={16} />
            </button>
          )}

          <div className="flex items-center gap-2 text-sm min-w-0">
            <span style={{ color: "var(--ink-subtle)" }}>
              {selectedProject ? selectedProject.name : "Workspace"}
            </span>
            {selectedProject && (
              <>
                <span style={{ color: "var(--ink-tertiary)" }}>/</span>
                <span className="font-medium truncate" style={{ color: "var(--ink)" }}>
                  {VIEW_LABELS[activeView] || "Chat"}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {renderContent()}
        </div>
      </div>

      <CreateProject
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createProject}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

    </div>
  );
}


export default Home;
