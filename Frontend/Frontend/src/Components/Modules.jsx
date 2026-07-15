import { Plus, Trash2, Layers } from "lucide-react";


function Modules({ selectedProject, modules, setModules }) {


  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        description: "",
        complexity: "Medium",
        userStories: 0,
      },
    ]);
  };


  const updateModule = (id, field, value) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };


  const removeModule = (id) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };


  const totalStories = modules.reduce(
    (sum, m) => sum + (Number(m.userStories) || 0),
    0
  );


  return (

    <div
      className="
        flex-1
        flex
        flex-col
        overflow-hidden
      "
      style={{ backgroundColor: "var(--canvas)" }}
    >


      {/* Header */}

      <div
        className="
          p-8
          pb-4
          border-b
        "
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor: "var(--hairline)",
        }}
      >

        <div className="
          flex
          items-center
          justify-between
        ">

          <div>
            <h1
              className="
                text-2xl
                font-semibold
              "
              style={{ color: "var(--ink)" }}
            >
              Modules
            </h1>

            <p
              className="
                text-sm
                mt-1
              "
              style={{ color: "var(--ink-muted)" }}
            >
              {selectedProject.name} — Define modules with complexity and user story counts.
            </p>
          </div>


          <button
            onClick={addModule}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-4
              py-2.5
              text-sm
              font-medium
              transition
              hover:opacity-90
            "
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--on-primary)",
            }}
          >
            <Plus size={16} />
            Add Module
          </button>

        </div>


        {/* Summary Stats */}

        {modules.length > 0 && (

          <div className="
            flex
            gap-6
            mt-4
          ">

            <div
              className="
                flex
                items-center
                gap-2
                text-sm
              "
              style={{ color: "var(--ink-muted)" }}
            >
              <Layers size={14} style={{ color: "var(--primary)" }} />
              <span className="font-medium">{modules.length}</span> modules
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                text-sm
              "
              style={{ color: "var(--ink-muted)" }}
            >
              <span className="font-medium">{totalStories}</span> total user stories
            </div>

          </div>

        )}

      </div>



      {/* Content */}

      <div className="
        flex-1
        overflow-y-auto
        p-8
      ">


        {/* Empty State */}

        {modules.length === 0 && (

          <div className="
            flex
            flex-col
            items-center
            justify-center
            h-full
            text-center
          ">

            <div
              className="
                w-16
                h-16
                rounded-full
                flex
                items-center
                justify-center
                mb-4
              "
              style={{ backgroundColor: "var(--primary-soft)" }}
            >
              <Layers size={28} style={{ color: "var(--primary)" }} />
            </div>

            <p
              className="
                text-lg
                font-medium
              "
              style={{ color: "var(--ink-muted)" }}
            >
              No modules yet
            </p>

            <p
              className="
                text-sm
                mt-1
                max-w-sm
              "
              style={{ color: "var(--ink-subtle)" }}
            >
              Add modules to define the scope, complexity, and user stories for your project.
            </p>

            <button
              onClick={addModule}
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-lg
                px-5
                py-2.5
                text-sm
                font-medium
                transition
                hover:opacity-90
              "
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
              }}
            >
              <Plus size={16} />
              Add First Module
            </button>

          </div>

        )}



        {/* Data Table */}

        {modules.length > 0 && (

          <div
            className="
              border
              rounded-xl
              shadow-sm
              overflow-hidden
            "
            style={{
              backgroundColor: "var(--surface-1)",
              borderColor: "var(--hairline)",
            }}
          >

            <table className="w-full">

              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    borderColor: "var(--hairline)",
                  }}
                >
                  <th
                    className="
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      px-5
                      py-3
                    "
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Module Name
                  </th>

                  <th
                    className="
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      px-5
                      py-3
                    "
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Description
                  </th>

                  <th
                    className="
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      px-5
                      py-3
                      w-44
                    "
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Complexity
                  </th>

                  <th
                    className="
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      px-5
                      py-3
                      w-44
                    "
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    No. of User Stories
                  </th>

                  <th className="
                    w-16
                    px-5
                    py-3
                  ">
                  </th>
                </tr>
              </thead>


              <tbody>

                {modules.map((module, index) => (

                  <tr
                    key={module.id}
                    className={`
                      border-b
                      transition-colors
                      ${index === modules.length - 1 ? "border-b-0" : ""}
                    `}
                    style={{ borderColor: "var(--hairline)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--surface-2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >

                    {/* Module Name */}
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={module.name}
                        onChange={(e) =>
                          updateModule(module.id, "name", e.target.value)
                        }
                        placeholder="e.g., User Authentication"
                        className="
                          w-full
                          rounded-lg
                          border
                          px-3
                          py-2
                          text-sm
                          outline-none
                        "
                        style={{
                          backgroundColor: "var(--surface-1)",
                          borderColor: "var(--hairline-strong)",
                          color: "var(--ink)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "var(--primary)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "var(--hairline-strong)")
                        }
                      />
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={module.description || ""}
                        onChange={(e) =>
                          updateModule(module.id, "description", e.target.value)
                        }
                        placeholder="Module description..."
                        className="
                          w-full
                          rounded-lg
                          border
                          px-3
                          py-2
                          text-sm
                          outline-none
                        "
                        style={{
                          backgroundColor: "var(--surface-1)",
                          borderColor: "var(--hairline-strong)",
                          color: "var(--ink)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "var(--primary)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "var(--hairline-strong)")
                        }
                      />
                    </td>

                    {/* Complexity */}
                    <td className="px-5 py-3">
                      <select
                        value={module.complexity}
                        onChange={(e) =>
                          updateModule(module.id, "complexity", e.target.value)
                        }
                        className="
                          w-full
                          rounded-lg
                          border
                          px-3
                          py-2
                          text-sm
                          outline-none
                        "
                        style={{
                          backgroundColor: "var(--surface-1)",
                          borderColor: "var(--hairline-strong)",
                          color: "var(--ink)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "var(--primary)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "var(--hairline-strong)")
                        }
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </td>

                    {/* User Stories */}
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min="0"
                        value={module.userStories}
                        onChange={(e) =>
                          updateModule(module.id, "userStories", e.target.value)
                        }
                        placeholder="0"
                        className="
                          w-full
                          rounded-lg
                          border
                          px-3
                          py-2
                          text-sm
                          outline-none
                        "
                        style={{
                          backgroundColor: "var(--surface-1)",
                          borderColor: "var(--hairline-strong)",
                          color: "var(--ink)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "var(--primary)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "var(--hairline-strong)")
                        }
                      />
                    </td>

                    {/* Delete */}
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => removeModule(module.id)}
                        className="
                          transition-colors
                          p-1
                        "
                        style={{ color: "var(--ink-subtle)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--danger)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--ink-subtle)")
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>


            {/* Add Row Button */}

            <div
              className="
                border-t
                px-5
                py-3
              "
              style={{ borderColor: "var(--hairline)" }}
            >
              <button
                onClick={addModule}
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  transition-colors
                  hover:opacity-80
                "
                style={{ color: "var(--primary)" }}
              >
                <Plus size={15} />
                Add Module
              </button>
            </div>

          </div>

        )}


      </div>


    </div>

  );
}


export default Modules;
