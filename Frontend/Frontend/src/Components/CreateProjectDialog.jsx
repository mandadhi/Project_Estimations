import { X } from "lucide-react";
import { useState } from "react";


function CreateProject({ isOpen, onClose, onCreate }) {

  const [project, setProject] = useState({
    name: "",
    description: "",
    client: "",
  });



  const handleSubmit = (e) => {
    e.preventDefault();

    onCreate({
      id: Date.now(),
      ...project
    });

    onClose();
  };


  if (!isOpen) return null;


  const inputClass = `
    mt-1
    w-full
    rounded-lg
    border
    px-3
    py-2
    text-sm
    outline-none
    transition-shadow
  `;

  const inputStyle = {
    backgroundColor: "var(--surface-2)",
    border: "1px solid var(--hairline-strong)",
    color: "var(--ink)",
  };

  const handleFocus = (e) => {
    e.target.style.border = "1px solid var(--primary)";
  };

  const handleBlur = (e) => {
    e.target.style.border = "1px solid var(--hairline-strong)";
  };


  return (

    <div
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        z-50
      "
      style={{ backgroundColor: "var(--overlay)" }}
    >


      <div
        className="
          w-full
          max-w-md
          rounded-xl
          p-6
        "
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-md)",
        }}
      >


        {/* Header */}

        <div className="
          flex
          items-center
          justify-between
          mb-5
        ">

          <h2
            className="
              text-lg
              font-semibold
            "
            style={{ color: "var(--ink)" }}
          >
            Create Project
          </h2>


          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--ink-subtle)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--surface-2)";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--ink-subtle)";
            }}
          >
            <X size={18}/>
          </button>

        </div>





        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >


          {/* Project Name */}

          <div>

            <label
              className="
                text-sm
                font-medium
              "
              style={{ color: "var(--ink-muted)" }}
            >
              Project Name
            </label>


            <input
              required
              value={project.name}
              onChange={(e)=>
                setProject({
                  ...project,
                  name:e.target.value
                })
              }
              placeholder="Website redesign"
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

          </div>





          {/* Client */}

          <div>

            <label
              className="
                text-sm
                font-medium
              "
              style={{ color: "var(--ink-muted)" }}
            >
              Client
            </label>


            <input
              value={project.client}
              onChange={(e)=>
                setProject({
                  ...project,
                  client:e.target.value
                })
              }
              placeholder="Client name"
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

          </div>





          {/* Description */}

          <div>

            <label
              className="
                text-sm
                font-medium
              "
              style={{ color: "var(--ink-muted)" }}
            >
              Description
            </label>


            <textarea
              rows="3"
              value={project.description}
              onChange={(e)=>
                setProject({
                  ...project,
                  description:e.target.value
                })
              }
              placeholder="Project description..."
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

          </div>





          {/* Actions */}

          <div className="
            flex
            justify-end
            gap-3
            pt-4
          ">


            <button
              type="button"
              onClick={onClose}
              className="
                px-4
                py-2
                text-sm
                rounded-lg
                transition-colors
              "
              style={{ color: "var(--ink-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="
                px-5
                py-2
                text-sm
                rounded-lg
                hover:opacity-90
                transition-opacity
              "
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
              }}
            >
              Create
            </button>


          </div>


        </form>


      </div>


    </div>

  );
}


export default CreateProject;
