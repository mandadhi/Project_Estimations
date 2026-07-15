import { useState } from "react";
import {
  X,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Camera,
} from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";


function Settings({ isOpen, onClose }) {

  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    bio: "",
  });

  const [saved, setSaved] = useState(false);


  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaved(false);
  };


  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };


  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  if (!isOpen) return null;


  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { id: "privacy", label: "Privacy", icon: <Shield size={16} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
    { id: "data", label: "Data Controls", icon: <Database size={16} /> },
  ];


  return (

    <div
      onClick={handleBackdropClick}
      style={{ background: "var(--overlay)" }}
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        animate-[fadeIn_200ms_ease-out]
      "
    >

      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-md)",
        }}
        className="
          w-full
          max-w-2xl
          max-h-[85vh]
          flex
          flex-col
          overflow-hidden
          animate-[scaleIn_200ms_ease-out]
        "
      >


        {/* Header */}

        <div
          style={{ borderBottom: "1px solid var(--hairline)" }}
          className="
            flex
            items-center
            justify-between
            px-6
            py-4
          "
        >

          <h2
            style={{ color: "var(--ink)" }}
            className="
              text-lg
              font-semibold
            "
          >
            Settings
          </h2>

          <button
            onClick={onClose}
            style={{ color: "var(--ink-subtle)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--ink-subtle)";
            }}
            className="
              rounded-lg
              p-1.5
              transition-colors
            "
          >
            <X size={18} />
          </button>

        </div>


        {/* Body */}

        <div className="flex flex-1 overflow-hidden">


          {/* Sidebar Tabs */}

          <nav
            style={{
              background: "var(--surface-2)",
              borderRight: "1px solid var(--hairline)",
            }}
            className="
              w-48
              py-3
              px-2
              flex-shrink-0
              overflow-y-auto
            "
          >

            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isActive ? "var(--surface-3)" : "transparent",
                    color: isActive ? "var(--ink)" : "var(--ink-muted)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                  className={`
                    flex
                    items-center
                    gap-2.5
                    w-full
                    px-3
                    py-2
                    rounded-lg
                    text-sm
                    transition-colors
                    mb-0.5
                    ${isActive ? "font-medium" : ""}
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}

          </nav>


          {/* Content Area */}

          <div
            className="
              flex-1
              overflow-y-auto
              px-6
              py-5
            "
          >

            {activeTab === "profile" && (

              <ProfileSection
                profile={profile}
                onChange={handleChange}
                onSave={handleSave}
                saved={saved}
              />

            )}


            {activeTab === "notifications" && (
              <PlaceholderSection
                title="Notifications"
                description="Configure how you receive notifications and alerts."
              />
            )}


            {activeTab === "privacy" && (
              <PlaceholderSection
                title="Privacy"
                description="Manage your privacy settings and data sharing preferences."
              />
            )}


            {activeTab === "appearance" && <AppearanceSection />}


            {activeTab === "data" && (
              <PlaceholderSection
                title="Data Controls"
                description="Manage your data, exports, and storage preferences."
              />
            )}

          </div>


        </div>


      </div>

    </div>

  );
}


function ProfileSection({ profile, onChange, onSave, saved }) {

  return (

    <div>

      <h3
        className="
          text-base
          font-semibold
          mb-1
        "
        style={{ color: "var(--ink)" }}
      >
        Profile
      </h3>

      <p
        className="
          text-sm
          mb-6
        "
        style={{ color: "var(--ink-muted)" }}
      >
        Manage your personal information and how others see you.
      </p>


      {/* Avatar */}

      <div
        className="
          flex
          items-center
          gap-4
          mb-6
        "
      >

        <div
          className="
            relative
            group
            cursor-pointer
          "
        >
          <div
            className="
              h-16
              w-16
              rounded-full
              flex
              items-center
              justify-center
              text-xl
              font-bold
            "
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {profile.name
              ? profile.name.charAt(0).toUpperCase()
              : "U"
            }
          </div>

          <div
            className="
              absolute
              inset-0
              rounded-full
              flex
              items-center
              justify-center
              opacity-0
              group-hover:opacity-100
              transition-opacity
            "
            style={{ background: "var(--overlay)" }}
          >
            <Camera size={18} style={{ color: "var(--on-primary)" }} />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium" style={{ color: "var(--ink-muted)" }}>
            Profile Photo
          </p>
          <p className="text-xs" style={{ color: "var(--ink-subtle)" }}>
            Click to upload a new photo
          </p>
        </div>

      </div>


      {/* Form */}

      <form onSubmit={onSave} className="space-y-4">


        {/* Name & Email Row */}

        <div className="grid grid-cols-2 gap-4">

          <ProfileField
            label="Full Name"
            value={profile.name}
            onChange={(val) => onChange("name", val)}
            placeholder="John Doe"
          />

          <ProfileField
            label="Email"
            type="email"
            value={profile.email}
            onChange={(val) => onChange("email", val)}
            placeholder="john@example.com"
          />

        </div>


        {/* Phone & Company Row */}

        <div className="grid grid-cols-2 gap-4">

          <ProfileField
            label="Phone"
            type="tel"
            value={profile.phone}
            onChange={(val) => onChange("phone", val)}
            placeholder="+1 (555) 000-0000"
          />

          <ProfileField
            label="Company"
            value={profile.company}
            onChange={(val) => onChange("company", val)}
            placeholder="Acme Corp"
          />

        </div>


        {/* Role */}

        <ProfileField
          label="Role"
          value={profile.role}
          onChange={(val) => onChange("role", val)}
          placeholder="Software Engineer"
        />


        {/* Bio */}

        <div>

          <label
            className="
              text-sm
              font-medium
              block
              mb-1
            "
            style={{ color: "var(--ink-muted)" }}
          >
            Bio
          </label>

          <textarea
            rows="3"
            value={profile.bio}
            onChange={(e) => onChange("bio", e.target.value)}
            placeholder="Tell us a little about yourself..."
            className="
              w-full
              rounded-lg
              border
              px-3
              py-2
              text-sm
              outline-none
              resize-none
              transition-shadow
            "
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--hairline-strong)",
              color: "var(--ink)",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid var(--primary)")}
            onBlur={(e) => (e.target.style.border = "1px solid var(--hairline-strong)")}
          />

        </div>


        {/* Actions */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-3
            pt-3
            border-t
          "
          style={{ borderColor: "var(--hairline)" }}
        >

          <span
            className={`
              text-sm
              transition-opacity
              duration-300
              ${saved ? "opacity-100" : "opacity-0"}
            `}
            style={{ color: "var(--success)" }}
          >
            Changes saved
          </span>

          <button
            type="submit"
            className="
              px-5
              py-2
              text-sm
              font-medium
              rounded-lg
              hover:opacity-90
              transition-opacity
            "
            style={{
              background: "var(--primary)",
              color: "var(--on-primary)",
            }}
          >
            Save
          </button>

        </div>


      </form>

    </div>

  );

}


function ProfileField({ label, value, onChange, placeholder, type = "text" }) {

  return (

    <div>

      <label
        className="
          text-sm
          font-medium
          block
          mb-1
        "
        style={{ color: "var(--ink-muted)" }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-lg
          border
          px-3
          py-2
          text-sm
          outline-none
          transition-shadow
        "
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--hairline-strong)",
          color: "var(--ink)",
        }}
        onFocus={(e) => (e.target.style.border = "1px solid var(--primary)")}
        onBlur={(e) => (e.target.style.border = "1px solid var(--hairline-strong)")}
      />

    </div>

  );

}


function AppearanceSection() {

  const { theme, setTheme } = useTheme();

  const options = [
    {
      id: "dark",
      title: "Dark (Linear)",
      description: "Near-black canvas with a lavender accent.",
    },
    {
      id: "light",
      title: "Light (Notion)",
      description: "Warm white canvas with a blue accent.",
    },
  ];

  return (

    <div>

      <h3
        className="text-base font-semibold mb-1"
        style={{ color: "var(--ink)" }}
      >
        Appearance
      </h3>

      <p
        className="text-sm mb-6"
        style={{ color: "var(--ink-muted)" }}
      >
        Customize the look and feel of the application.
      </p>

      <div className="grid grid-cols-2 gap-4">

        {options.map((option) => {
          const isActive = theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className="
                text-left
                rounded-xl
                p-4
                transition-colors
              "
              style={{
                background: "var(--surface-2)",
                border: isActive
                  ? "2px solid var(--primary)"
                  : "1px solid var(--hairline)",
                boxShadow: isActive ? "0 0 0 1px var(--primary)" : "none",
              }}
            >
              <span
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--ink)" }}
              >
                {option.title}
              </span>
              <span
                className="block text-xs"
                style={{ color: "var(--ink-muted)" }}
              >
                {option.description}
              </span>
            </button>
          );
        })}

      </div>

    </div>

  );

}


function PlaceholderSection({ title, description }) {

  return (

    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        h-full
        min-h-[300px]
        text-center
      "
    >

      <div
        className="
          h-12
          w-12
          rounded-full
          flex
          items-center
          justify-center
          mb-3
        "
        style={{ background: "var(--surface-2)" }}
      >
        <Palette size={20} style={{ color: "var(--ink-subtle)" }} />
      </div>

      <h3 className="text-base font-semibold mb-1" style={{ color: "var(--ink)" }}>
        {title}
      </h3>

      <p className="text-sm max-w-xs" style={{ color: "var(--ink-muted)" }}>
        {description}
      </p>

    </div>

  );

}


export default Settings;
