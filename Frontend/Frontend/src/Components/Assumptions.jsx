import { useState } from "react";
import { Plus, Trash2, Lightbulb } from "lucide-react";


function Assumptions({ selectedProject }) {

  const [assumptions, setAssumptions] = useState([]);


  const addAssumption = () => {
    setAssumptions((prev) => [
      ...prev,
      {
        id: Date.now(),
        moduleName: "",
        description: "",
      },
    ]);
  };


  const updateAssumption = (id, field, value) => {
    setAssumptions((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      )
    );
  };


  const removeAssumption = (id) => {
    setAssumptions((prev) => prev.filter((a) => a.id !== id));
  };


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
              Assumptions
            </h1>

            <p
              className="
                text-sm
                mt-1
              "
              style={{ color: "var(--ink-muted)" }}
            >
              {selectedProject.name} — Document the assumptions for each module.
            </p>
          </div>


          <button
            onClick={addAssumption}
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

        {assumptions.length > 0 && (

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
              <Lightbulb size={14} style={{ color: "var(--primary)" }} />
              <span className="font-medium">{assumptions.length}</span> assumptions
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

        {assumptions.length === 0 && (

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
              <Lightbulb size={28} style={{ color: "var(--primary)" }} />
            </div>

            <p
              className="
                text-lg
                font-medium
              "
              style={{ color: "var(--ink-muted)" }}
            >
              No assumptions yet
            </p>

            <p
              className="
                text-sm
                mt-1
                max-w-sm
              "
              style={{ color: "var(--ink-subtle)" }}
            >
              Add assumptions to document the conditions you expect to hold true during this project.
            </p>

            <button
              onClick={addAssumption}
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
              Add First Assumption
            </button>

          </div>

        )}



        {/* Data Table */}

        {assumptions.length > 0 && (

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
                      w-64
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
                    Assumption Description
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

                {assumptions.map((assumption, index) => (

                  <tr
                    key={assumption.id}
                    className={`
                      border-b
                      transition-colors
                      ${index === assumptions.length - 1 ? "border-b-0" : ""}
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
                        value={assumption.moduleName}
                        onChange={(e) =>
                          updateAssumption(assumption.id, "moduleName", e.target.value)
                        }
                        placeholder="e.g., Payment Gateway"
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
                        value={assumption.description}
                        onChange={(e) =>
                          updateAssumption(assumption.id, "description", e.target.value)
                        }
                        placeholder="Describe the assumption..."
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
                        onClick={() => removeAssumption(assumption.id)}
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
                onClick={addAssumption}
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


export default Assumptions;
