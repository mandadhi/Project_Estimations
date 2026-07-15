import { useState, useCallback } from "react";
import {
  RefreshCw,
  Download,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  TableIcon,
  Undo,
  Redo,
  Minus,
  Columns,
  Rows,
  Trash2,
} from "lucide-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExt from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";


function generateTemplate(projectName) {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const version = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`;

  const clientNames = [
    "Rajesh Kumar",
    "Emily Carter",
    "Carlos Mendes",
    "Aisha Patel",
    "Thomas Wright",
    "Mei Lin Chen",
  ];

  const shuffledClients = clientNames.sort(() => 0.5 - Math.random());
  const clientName = shuffledClients[0];

  return `
<h1>Project Proposal Document</h1>
<h2>${projectName}</h2>

<table>
  <tbody>
    <tr>
      <td><strong>Version</strong></td>
      <td>${version}</td>
      <td><strong>Date</strong></td>
      <td>${date}</td>
    </tr>
    <tr>
      <td><strong>Prepared for</strong></td>
      <td>${clientName}</td>
      <td><strong>Status</strong></td>
      <td>Draft</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1. Project Details</h2>
<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Detail</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Project Name</strong></td>
      <td>${projectName}</td>
    </tr>
    <tr>
      <td><strong>Objective</strong></td>
      <td>Deliver a comprehensive end-to-end solution addressing the client's core business requirements — from discovery and requirements analysis through design, development, QA, and production deployment.</td>
    </tr>
    <tr>
      <td><strong>Methodology</strong></td>
      <td>Agile (two-week sprint cycles with continuous feedback loops and iterative delivery)</td>
    </tr>
    <tr>
      <td><strong>Team Composition</strong></td>
      <td>UI/UX Designers, Frontend Developers, Backend Developers, QA Engineers, DevOps Engineer, Project Manager</td>
    </tr>
    <tr>
      <td><strong>Estimated Timeline</strong></td>
      <td>14–18 weeks</td>
    </tr>
    <tr>
      <td><strong>Engagement Model</strong></td>
      <td>Fixed-scope with milestone-based delivery</td>
    </tr>
    <tr>
      <td><strong>Communication</strong></td>
      <td>Weekly status reports, bi-weekly sprint demos, dedicated Slack channel</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>2. Deliverables</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Deliverable</th>
      <th>Description</th>
      <th>Format</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><strong>Functional Requirements Document</strong></td>
      <td>Detailed specification of all features, user flows, and acceptance criteria</td>
      <td>PDF / Confluence</td>
    </tr>
    <tr>
      <td>2</td>
      <td><strong>UI/UX Design Assets</strong></td>
      <td>Wireframes, high-fidelity mockups, interactive prototypes, and design system</td>
      <td>Figma</td>
    </tr>
    <tr>
      <td>3</td>
      <td><strong>Source Code Repository</strong></td>
      <td>Version-controlled codebase with inline documentation and README</td>
      <td>GitHub / GitLab</td>
    </tr>
    <tr>
      <td>4</td>
      <td><strong>API Documentation</strong></td>
      <td>Comprehensive REST/GraphQL API reference with request/response examples</td>
      <td>Swagger / Postman</td>
    </tr>
    <tr>
      <td>5</td>
      <td><strong>Test Suite & Coverage Report</strong></td>
      <td>Unit, integration, and end-to-end test results with coverage metrics</td>
      <td>HTML Report</td>
    </tr>
    <tr>
      <td>6</td>
      <td><strong>Deployment Package</strong></td>
      <td>Production-ready build with CI/CD pipeline configuration and rollback scripts</td>
      <td>Docker / CI Config</td>
    </tr>
    <tr>
      <td>7</td>
      <td><strong>User Manual / Admin Guide</strong></td>
      <td>End-user and administrator documentation with screenshots and FAQs</td>
      <td>PDF / Web</td>
    </tr>
    <tr>
      <td>8</td>
      <td><strong>Post-Launch Support Plan</strong></td>
      <td>30-day warranty support with SLA definitions and escalation matrix</td>
      <td>PDF</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>3. Scope Management</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>In Scope</th>
      <th>#</th>
      <th>Out of Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Requirements analysis and stakeholder workshops</td>
      <td>1</td>
      <td>Native mobile application development (iOS/Android)</td>
    </tr>
    <tr>
      <td>2</td>
      <td>UI/UX design — wireframes, prototypes, and final visual design</td>
      <td>2</td>
      <td>Content creation, copywriting, or translation services</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Frontend development (responsive web application)</td>
      <td>3</td>
      <td>Ongoing maintenance beyond the 30-day warranty period</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Backend API development and database design</td>
      <td>4</td>
      <td>Hardware procurement or infrastructure provisioning</td>
    </tr>
    <tr>
      <td>5</td>
      <td>Third-party integrations (payment gateway, email, analytics)</td>
      <td>5</td>
      <td>SEO optimization and digital marketing campaigns</td>
    </tr>
    <tr>
      <td>6</td>
      <td>User authentication and role-based access control</td>
      <td>6</td>
      <td>Compliance audits or legal reviews (GDPR, HIPAA, etc.)</td>
    </tr>
    <tr>
      <td>7</td>
      <td>Quality assurance — functional, regression, and performance testing</td>
      <td>7</td>
      <td>Training sessions beyond the included two onboarding workshops</td>
    </tr>
    <tr>
      <td>8</td>
      <td>Staging and production environment setup</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>9</td>
      <td>Data migration from the existing legacy system</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>10</td>
      <td>30-day post-launch bug-fix support</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>4. Modules</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Module</th>
      <th>Description</th>
      <th>Key Features</th>
      <th>Complexity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><strong>User Management</strong></td>
      <td>Handles user lifecycle — registration, authentication, profile management, and role-based access control with OAuth 2.0 social login and self-service password recovery.</td>
      <td>Registration & Login, OAuth 2.0 (Google, Microsoft), Role-based access control, Admin user dashboard</td>
      <td>High</td>
    </tr>
    <tr>
      <td>2</td>
      <td><strong>Dashboard & Analytics</strong></td>
      <td>Centralized dashboard providing real-time insights with configurable widgets, date-range filtering, role-specific views, and data aggregation via background jobs.</td>
      <td>Configurable widgets, Bar/line/pie/funnel charts, Data export (CSV/PDF), Role-specific views</td>
      <td>High</td>
    </tr>
    <tr>
      <td>3</td>
      <td><strong>Notification & Communication</strong></td>
      <td>Manages system-generated notifications across in-app, email, and SMS channels with granular user preferences, template engine, delivery tracking, and retry mechanisms.</td>
      <td>Multi-channel (in-app, email, SMS), Template engine, Delivery tracking & retries, Batch notifications</td>
      <td>Medium</td>
    </tr>
    <tr>
      <td>4</td>
      <td><strong>Reporting & Export</strong></td>
      <td>Structured report generation with predefined and custom templates, drag-and-drop field selection, and scheduled delivery. Export in PDF, Excel, and CSV formats.</td>
      <td>Predefined + custom reports, Drag-and-drop builder, Scheduled email delivery, PDF/Excel/CSV export</td>
      <td>Medium</td>
    </tr>
    <tr>
      <td>5</td>
      <td><strong>Integration & API Gateway</strong></td>
      <td>Centralized integration layer managing external API connections with rate limiting, request logging, circuit-breaker patterns, webhook management, and a developer sandbox.</td>
      <td>Payment & email integrations, Rate limiting & circuit breaker, Webhook management, Developer sandbox</td>
      <td>Critical</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>5. Assumptions</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Module</th>
      <th>Assumption Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>User Management</td>
      <td>The client will provide existing user data in a structured CSV or JSON format for migration. OAuth provider credentials (Google, Microsoft) will be provisioned by the client before development begins.</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Dashboard & Analytics</td>
      <td>Historical data for the analytics dashboard will be limited to the past 24 months. Real-time data refresh intervals of 60 seconds are acceptable for dashboard widgets.</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Notification Module</td>
      <td>The client will provide an existing SMTP server or approve the use of a third-party email service (e.g., SendGrid). SMS notifications are limited to domestic numbers only.</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Reporting & Export</td>
      <td>Report data volume will not exceed 100,000 records per report generation request. Custom report templates beyond the five predefined ones will require a separate change request.</td>
    </tr>
    <tr>
      <td>5</td>
      <td>Integration & API</td>
      <td>All third-party API documentation and sandbox credentials will be provided by the client at least two weeks before the integration sprint. API rate limits imposed by third-party services will be communicated upfront.</td>
    </tr>
    <tr>
      <td>6</td>
      <td>General</td>
      <td>The client will designate a single point of contact available for clarifications within 24 business hours. Feedback on deliverables will be provided within 5 business days of submission. No major scope changes will be introduced after the design sign-off milestone.</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>6. Risks</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Module</th>
      <th>Severity</th>
      <th>Risk Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>User Management</td>
      <td><strong>High</strong></td>
      <td>Legacy user data may contain inconsistencies or duplicate records that require manual cleansing before migration. OAuth provider policy changes during development could require re-implementation of the authentication flow.</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Dashboard & Analytics</td>
      <td><strong>Medium</strong></td>
      <td>Large data volumes may cause performance degradation if indexing strategies are not optimized early. Frequent changes to KPI definitions during development may delay delivery.</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Notification Module</td>
      <td><strong>Medium</strong></td>
      <td>Email deliverability issues (spam filtering, domain reputation) may require additional DNS configuration and warm-up period. SMS gateway downtime could affect time-sensitive notification delivery.</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Integration & API</td>
      <td><strong>High</strong></td>
      <td>Third-party API breaking changes or deprecations could introduce unplanned rework. Delayed provisioning of sandbox credentials may block integration testing sprints. Rate limit restrictions may require architectural changes to implement queuing.</td>
    </tr>
    <tr>
      <td>5</td>
      <td>General</td>
      <td><strong>Low</strong></td>
      <td>Delayed client feedback beyond the agreed SLA may push milestone dates. Resource attrition during the project lifecycle may require onboarding replacement team members.</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>7. Project Estimation</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Department</th>
      <th>Estimated Hours</th>
      <th>Estimated Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>UX Research & Strategy</td>
      <td>80</td>
      <td>$8,000</td>
    </tr>
    <tr>
      <td>2</td>
      <td>UI Design</td>
      <td>120</td>
      <td>$12,000</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Frontend Development</td>
      <td>320</td>
      <td>$38,400</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Backend Development</td>
      <td>280</td>
      <td>$33,600</td>
    </tr>
    <tr>
      <td>5</td>
      <td>Quality Assurance (QA)</td>
      <td>160</td>
      <td>$14,400</td>
    </tr>
    <tr>
      <td>6</td>
      <td>DevOps & Infrastructure</td>
      <td>60</td>
      <td>$7,200</td>
    </tr>
    <tr>
      <td>7</td>
      <td>Project Management</td>
      <td>80</td>
      <td>$8,000</td>
    </tr>
    <tr>
      <td></td>
      <td><strong>Total Project Estimate</strong></td>
      <td><strong>1,100</strong></td>
      <td><strong>$121,600</strong></td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>8. Sign-off</h2>
<p>By signing below, the client acknowledges that they have reviewed and approved this proposal document, including the scope, deliverables, assumptions, risks, and project estimation outlined herein.</p>

<br/>
<br/>

<p style="text-align: right">___________________________________</p>
<p style="text-align: right"><strong>${clientName}</strong></p>
<p style="text-align: right">Authorized Client Representative</p>
<p style="text-align: right">Date: _______________</p>

<br/>

<p><em>This proposal was auto-generated as a template. Please edit the sections above to reflect the actual project details before sign-off.</em></p>
  `.trim();
}


function ToolbarButton({ onClick, isActive, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded transition-colors"
      style={{
        backgroundColor: isActive ? "var(--primary-soft)" : "transparent",
        color: isActive ? "var(--primary)" : "var(--ink-subtle)",
      }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "var(--surface-3)"; e.currentTarget.style.color = "var(--ink)"; } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--ink-subtle)"; } }}
    >
      {children}
    </button>
  );
}


function ToolbarDivider() {
  return (
    <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--hairline)" }} />
  );
}


function EditorToolbar({ editor }) {

  if (!editor) return null;

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (

    <div
      className="flex items-center gap-0.5 flex-wrap border-b px-3 py-2"
      style={{ borderColor: "var(--hairline)", backgroundColor: "var(--surface-2)" }}
    >

      {/* Undo / Redo */}

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
      >
        <Undo size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
      >
        <Redo size={15} />
      </ToolbarButton>

      <ToolbarDivider />


      {/* Headings */}

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={15} />
      </ToolbarButton>

      <ToolbarDivider />


      {/* Inline Formatting */}

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <Underline size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={15} />
      </ToolbarButton>

      <ToolbarDivider />


      {/* Lists */}

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered size={15} />
      </ToolbarButton>

      <ToolbarDivider />


      {/* Text Align */}

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={15} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={15} />
      </ToolbarButton>

      <ToolbarDivider />


      {/* Horizontal Rule */}

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={15} />
      </ToolbarButton>

      <ToolbarDivider />


      {/* Table Controls */}

      <ToolbarButton
        onClick={addTable}
        title="Insert Table"
      >
        <TableIcon size={15} />
      </ToolbarButton>

      {editor.isActive("table") && (

        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Add Column"
          >
            <Columns size={15} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Add Row"
          >
            <Rows size={15} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Delete Table"
          >
            <Trash2 size={15} />
          </ToolbarButton>
        </>

      )}

    </div>

  );
}


function ReviewDocument({ selectedProject }) {

  const [templateHtml, setTemplateHtml] = useState(
    () => generateTemplate(selectedProject.name)
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "proposal-table" },
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      UnderlineExt,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: templateHtml,
    editorProps: {
      attributes: {
        class: "review-editor-content",
      },
    },
  });


  const handleRegenerate = useCallback(() => {
    const newHtml = generateTemplate(selectedProject.name);
    setTemplateHtml(newHtml);
    if (editor) {
      editor.commands.setContent(newHtml);
    }
  }, [editor, selectedProject.name]);


  const handleExport = useCallback(() => {
    if (!editor) return;

    const html = editor.getHTML();
    const fullDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${selectedProject.name} - Proposal</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 24px; color: #1e293b; line-height: 1.7; font-size: 14px; }
    h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    h2 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; }
    h3 { font-size: 1.05rem; font-weight: 600; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; font-size: 0.875rem; vertical-align: top; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
    ul, ol { padding-left: 1.5rem; }
    li { margin-bottom: 0.2rem; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullDocument], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedProject.name} - Proposal.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [editor, selectedProject.name]);


  return (

    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--canvas)" }}>


      {/* Header */}

      <div className="p-8 pb-4 border-b" style={{ borderColor: "var(--hairline)", backgroundColor: "var(--canvas)" }}>

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>
              Review & Export
            </h1>

            <p className="text-sm mt-1" style={{ color: "var(--ink-subtle)" }}>
              {selectedProject.name} — Edit the generated proposal and export when ready.
            </p>
          </div>


          <div className="flex items-center gap-3">

            <button
              onClick={handleRegenerate}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--hairline-strong)", color: "var(--ink-muted)", backgroundColor: "var(--surface-1)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface-3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--surface-1)"; }}
            >
              <RefreshCw size={16} />
              Regenerate
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--primary)"; }}
            >
              <Download size={16} />
              Export Document
            </button>

          </div>

        </div>

      </div>



      {/* Editor */}

      <div className="flex-1 overflow-y-auto p-8">

        {/*
          The proposal renders as a printable "paper" — kept in a light context
          in both app themes (like Google Docs) so the exported document matches
          what is on screen. Scoping data-theme="light" makes the token-based
          editor styles resolve to their light values inside this subtree only.
        */}
        <div
          data-theme="light"
          className="max-w-4xl mx-auto border rounded-xl overflow-hidden"
          style={{ backgroundColor: "#ffffff", borderColor: "var(--hairline)", boxShadow: "var(--shadow-md)" }}
        >

          <EditorToolbar editor={editor} />

          <EditorContent editor={editor} />

        </div>

      </div>


    </div>

  );
}


export default ReviewDocument;
