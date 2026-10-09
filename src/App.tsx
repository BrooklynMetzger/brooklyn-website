import { useEffect, useState } from "react";
// My portfolio is designed to look like a Windows XP desktop, since I enjoy the liminal aesthetic
// The code is written in TypeScript and React, and it fetches project data from GitHub
type View = "home" | "projects" | "about" | "contact";
type GitHubTreeItem = {
  path: string;
  type: "blob" | "tree";
  size?: number;
};
type Project = {
  name: string;
  repo: string;
  owner?: string;
  language: string;
  note: string;
  color: string;
};
// My GitHub username and the types of files that can be displayed in the code viewer
const github = "https://github.com/BrooklynMetzger";
const viewableFile = /\.(?:c|cc|cpp|css|h|hpp|html|java|js|json|jsx|md|me|py|rb|rs|sh|sql|svg|toml|ts|tsx|txt|vue|xml|ya?ml)$/i;

/*
 * Keeps the live file browser focused on readable source files. It rejects
 * folders, very large blobs, generated dependencies, build output, and lock
 * files before accepting known text extensions and a few extensionless files
 */
function canDisplayFile(file: GitHubTreeItem) {
  if (file.type !== "blob" || !file.path) return false;
  if (file.size && file.size > 500_000) return false;
  if (/(^|\/)(node_modules|dist|build|coverage|vendor)\//i.test(file.path)) return false;
  if (/(?:package-lock|pnpm-lock|yarn\.lock)$/i.test(file.path)) return false;
  return viewableFile.test(file.path) || /(^|\/)(?:makefile|dockerfile|\.gitignore)$/i.test(file.path);
}
// My portfolio projects, and some notes about them!
const projects: Project[] = [
  {
    name: "Racetrack — F1 Capstone",
    repo: "F1-Capstone-Project",
    owner: "as21emAS",
    language: "TypeScript + Python",
    note: "A collaborative F1 companion with race predictions, standings, historical data, and a live newsroom. 'I worked on primarly the frontend portion and overall design'",
    color: "#d94732",
  },
    {
    name: "Interactive Art Gallery",
    repo: "Mini_Interactive_Art_Gallery",
    language: "JavaScript",
    note: "A small interactive gallery to pass the time.",
    color: "#ef6b62",
  },
  {
    name: "Books Recommendation Project",
    repo: "Books_Rec_Project",
    language: "Python",
    note: "A book recommendation project, built with collaborative as a project. 'I worked on the backend API, database integration and setup, some frontend search features and design'",
    color: "#7967d8",
  },
  {
    name: "Infix to Postfix",
    repo: "In-fix_to_Post-fix_Converter",
    language: "C++",
    note: "A simple expression converter exploring stacks and parsing.",
    color: "#4c89df",
  },
  { // This Haunts me, but I am so very attached!
    name: "Hamster based image showcase",
    repo: "Poorly_drawn_hamster_memes_the_website",
    language: "CSS",
    note: "A simple website for hamster memes created in my spare time with friends chosing everything. Exactly what it says on the Lid.",
    color: "#e5a448",
  },
];
// All the used icon componets.
// paths: the outer SVG supplies shared sizing, stroke, and accessibility
function Icon({
  name,
  size = 20,
}: {
  name: "user" | "folder" | "mail" | "github" | "computer" | "arrow" | "power";
  size?: number;
}) {
  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    folder: <path d="M3 7h7l2 2h9v10H3zM3 7V5h7l2 2" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    github: (
      <>
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.33 1.08 2.9.83.09-.64.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.84a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
      </>
    ),
    computer: (
      <>
        <rect x="3" y="3" width="18" height="14" rx="1" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    arrow: <path d="m9 5 7 7-7 7" />,
    power: (
      <>
        <path d="M12 2v10" />
        <path d="M6.3 5.6a8 8 0 1 0 11.4 0" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "github" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

// Desktop shortcuts share one visual treatment and their behavior to
// the parent through "onOpen"
function DesktopIcon({
  icon,
  label,
  onOpen,
}: {
  icon: "user" | "folder" | "mail" | "github";
  label: string;
  onOpen: () => void;
}) {
  return (
    <button className="desktop-icon" onDoubleClick={onOpen} onClick={onOpen}>
      <span className={`desktop-icon-art ${icon}`}>
        <Icon name={icon} size={31} />
      </span>
      <span>{label}</span>
    </button>
  );
}

function App() {
  // The Desktop state
  const [view, setView] = useState<View>("home");
  const [startOpen, setStartOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [time, setTime] = useState(new Date());

  // The Browser project state
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  const [repoBranch, setRepoBranch] = useState("main");
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [copied, setCopied] = useState(false);
  const [codeExpanded, setCodeExpanded] = useState(false);

  // Refresh the taskbar clock every second, and fetch the project files when a project is selected
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  /**
   * Whenever a project is selected, ask GitHub for its default branch,
   * then request that branchs complete tree. The cleanup aborts
   * stale network work if the user changes projects before a response arrives.
   */
  useEffect(() => {
    if (selectedProject === null) return;

    const controller = new AbortController();
    let active = true;
    const project = projects[selectedProject];
    const owner = project.owner || "BrooklynMetzger";
    setTreeLoading(true);
    setTreeError("");
    setProjectFiles([]);
    setSelectedFile("");
    setFileContent("");

    fetch(`https://api.github.com/repos/${owner}/${project.repo}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Repository information could not be loaded.");
        return response.json() as Promise<{ default_branch: string }>;
      })
      .then((repository) => {
        // Display files the ptext viewer can render, then select the
        // README or first file as the first selection
        if (!active) return null;
        const branch = repository.default_branch || "main";
        setRepoBranch(branch);
        return fetch(
          `https://api.github.com/repos/${owner}/${project.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
          { signal: controller.signal },
        );
      })
      .then((response) => {
        if (!response) return null;
        if (!response.ok) throw new Error("Repository files could not be loaded.");
        return response.json() as Promise<{ tree: GitHubTreeItem[]; truncated?: boolean }>;
      })
      .then((data) => {
        if (!active || !data) return;
        const files = data.tree
          .filter(canDisplayFile)
          .map((file) => file.path)
          .sort((a, b) => a.localeCompare(b));
        setProjectFiles(files);
        const readme = files.find((file) => /^readme(?:\.|$)/i.test(file));
        setSelectedFile(readme || files[0] || "");
        if (!files.length) setTreeError("No viewable source files were found.");
      })
      .catch((error: Error) => {
        if (active && error.name !== "AbortError") {
          setTreeError("Could not load the repository files. GitHub may be rate limiting requests.");
        }
      })
      .finally(() => {
        if (active) setTreeLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject === null || !selectedFile) return;

    const controller = new AbortController();
    let active = true;
    const project = projects[selectedProject];
    const owner = project.owner || "BrooklynMetzger";
    setFileLoading(true);
    setFileError("");

    const encodedPath = selectedFile.split("/").map(encodeURIComponent).join("/");
    fetch(`https://raw.githubusercontent.com/${owner}/${project.repo}/${encodeURIComponent(repoBranch)}/${encodedPath}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("This file could not be loaded.");
        return response.text();
      })
      .then((content) => {
        if (active) setFileContent(content);
      })
      .catch((error: Error) => {
        if (active && error.name !== "AbortError") {
          setFileError("Could not load this file. You can still open it on GitHub.");
        }
      })
      .finally(() => {
        if (active) setFileLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [repoBranch, selectedFile, selectedProject]);

  useEffect(() => {
    if (!codeExpanded) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCodeExpanded(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [codeExpanded]);

  const openView = (next: View) => {
    setView(next);
    setSelectedProject(null);
    setCodeExpanded(false);
    setClosed(false);
    setMinimized(false);
    setStartOpen(false);
  };

  const openProject = (index: number) => {
    setSelectedProject(index);
    setFileError("");
  };

  const title = {
    home: "Welcome",
    projects: "My Projects",
    about: "About Me",
    contact: "Contact",
  }[view];

  return (
    <main className="desktop">
      {/* Overlays sit above the desktop wallpaper but ignore input, for style*/}
      <div className="dream-haze" />
      <div className="scanlines" />

      {/* Desktop shortcuts that work*/}
      <aside className="desktop-icons" aria-label="Desktop shortcuts">
        <DesktopIcon icon="user" label="About Me" onOpen={() => openView("about")} />
        <DesktopIcon icon="folder" label="My Projects" onOpen={() => openView("projects")} />
        <DesktopIcon icon="mail" label="Contact" onOpen={() => openView("contact")} />
        <DesktopIcon
          icon="github"
          label="GitHub"
          onOpen={() => window.open(github, "_blank", "noopener,noreferrer")}
        />
      </aside>

      {!closed && !minimized && (
        <section className="window" aria-label={`${title} window`}>
           {/* title, menu bar, and fake file path*/}
          <header className="titlebar">
            <div className="titlebar-name">
              <span className="mini-window-icon">
                <Icon name="computer" size={15} />
              </span>
              brooklyn.exe — {title}
            </div>
            <div className="window-actions">
              <button aria-label="Minimize window" onClick={() => setMinimized(true)}>
                _
              </button>
              <button aria-label="Maximize window">□</button>
              <button className="close" aria-label="Close window" onClick={() => setClosed(true)}>
                ×
              </button>
            </div>
          </header>

          <nav className="menu-strip" aria-label="Window menu">
            <button onClick={() => openView("home")}>
              <u>H</u>ome
            </button>
            <button onClick={() => openView("about")}>
              <u>A</u>bout
            </button>
            <button onClick={() => openView("projects")}>
              <u>P</u>rojects
            </button>
            <button onClick={() => openView("contact")}>
              <u>C</u>ontact
            </button>
          </nav>

          <div className="address-bar">
            <span>Address</span>
            <div>
              <span className="tiny-folder">
                <Icon name="folder" size={14} />
              </span>
              C:\Documents and Settings\Brooklyn\{title}
            </div>
            <button aria-label="Go">
              <Icon name="arrow" size={13} />
            </button>
          </div>

          <div className="window-body">
            {/* Windows task sidebar*/}
            <aside className="xp-sidebar">
              <div className="sidebar-panel">
                <h2>Portfolio Tasks <span>⌃</span></h2>
                <button onClick={() => openView("about")}>View Brooklyn’s profile</button>
                <button onClick={() => openView("projects")}>Browse source files</button>
                <a href={github} target="_blank" rel="noreferrer">Open GitHub page</a>
              </div>
              <div className="sidebar-panel details">
                <h2>Details <span>⌃</span></h2>
                <strong>Brooklyn Metzger</strong>
                <p>Developer &amp; creative coder</p>
                <p>7 public repositories</p>
              </div>
            </aside>

            <div className="content-pane">
              {view === "home" && (
                <div className="home-view">
                  <div className="profile-copy">
                    <p className="eyebrow share-tech-regular">WELCOME TO MY WEBSITE</p>
                    <h1>Hello, I’m <span>Brooklyn.</span></h1>
                    <p className="intro">
                      I am a Florida State Graduate, and I enjoy building somewhat strange things, along with a passion about computer security. 
                    </p>
                    <div className="cta-row">
                      <button className="xp-button primary" onClick={() => openView("projects")}>
                        Explore my work <Icon name="arrow" size={14} />
                      </button>
                      <button className="xp-button" onClick={() => openView("about")}>
                        About me
                      </button>
                    </div>
                  </div>
                  <div className="profile-card">
                    <div className="avatar-wrap">
                      {/*This is my account and website so showing my face is not doxing myself*/}
                      <img src="https://github.com/BrooklynMetzger.png" alt="Brooklyn Metzger" />
                      <span className="online-dot" />
                    </div>
                    <p>currently working on something suspicious</p>
                    <div className="status-line">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <p className="home-whisper">It always remembers you</p>
                </div>
              )}
              {/* Projects switches between the catalog and thier repository's
                source code browser*/}
              {view === "projects" && (
                <div className="projects-view">
                  {selectedProject === null ? (
                    <>
                      <div className="section-heading">
                        <div>
                          <p className="eyebrow share-tech-regular">SELECTED FILES</p>
                          <h1>Things I have worked on and or created</h1>
                        </div>
                        <span>{projects.length} objects</span>
                      </div>
                      <div className="project-grid">
                        {projects.map((project, index) => (
                          <button
                            className="project-card"
                            onClick={() => openProject(index)}
                            key={`${project.owner || "BrooklynMetzger"}/${project.repo}`}
                          >
                            <div className="project-folder" style={{ "--folder": project.color } as React.CSSProperties}>
                              <span />
                            </div>
                            <div className="project-info">
                              <div>
                                <h2>{project.name}</h2>
                                <span className="language">{project.language}</span>
                              </div>
                              <p>{project.note}</p>
                              <span className="open-project">View source code <Icon name="arrow" size={12} /></span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="code-view">
                      <div className="code-view-heading">
                        <div>
                          <button className="back-button" onClick={() => {
                            setSelectedProject(null);
                            setCodeExpanded(false);
                          }}>
                            ‹ Back to projects
                          </button>
                          <p className="eyebrow">GITHUB SOURCE</p>
                          <h1>{projects[selectedProject].name}</h1>
                          <p>{projects[selectedProject].note}</p>
                        </div>
                        <a
                          className="xp-button github-button"
                          href={`https://github.com/${projects[selectedProject].owner || "BrooklynMetzger"}/${projects[selectedProject].repo}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icon name="github" size={17} /> View on GitHub
                        </a>
                      </div>
                      {!codeExpanded ? (
                        <div className="source-launch">
                          <div className="source-launch-icon">
                            <Icon name="computer" size={30} />
                          </div>
                          <div>
                            <strong>Browse the source code</strong>
                            <p>
                              {treeLoading
                                ? "Loading files from GitHub…"
                                : treeError || `${projectFiles.length} source files ready to explore`}
                            </p>
                          </div>
                          <button
                            className="xp-button primary"
                            disabled={treeLoading || projectFiles.length === 0}
                            onClick={() => setCodeExpanded(true)}
                          >
                            View the source code<Icon name="arrow" size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="code-editor expanded">
                          <div className="code-toolbar">
                            <div className="file-tab">
                              <span className="file-dot" />
                              {selectedFile}
                            </div>
                            <div className="code-toolbar-actions">
                              <button onClick={() => setCodeExpanded(false)}>
                                Close large view
                              </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(fileContent);
                                setCopied(true);
                                window.setTimeout(() => setCopied(false), 1600);
                              }}
                            >
                              {copied ? "Copied!" : "Copy code"}
                            </button>
                            <button
                              className="editor-close"
                              aria-label="Close large code view"
                              onClick={() => setCodeExpanded(false)}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                          <div className="code-workspace">
                            <aside className="file-browser" aria-label="Project files">
                              <div className="file-browser-title">
                                <span>Project files</span>
                                <b>{projectFiles.length}</b>
                              </div>
                              {treeLoading && <span className="tree-state">Loading repository…</span>}
                              {treeError && <span className="tree-state error">{treeError}</span>}
                              {projectFiles.map((file) => (
                                <button
                                  className={selectedFile === file ? "selected" : ""}
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setCopied(false);
                                  }}
                                  title={file}
                                  key={file}
                                >
                                  <span className="tree-file-icon">&lt;/&gt;</span>
                                  <span>{file}</span>
                                </button>
                              ))}
                              <p>Loaded live from GitHub. Media and generated dependencies are hidden.</p>
                            </aside>
                            <pre aria-label={`${selectedFile} source code`}>
                              {fileLoading ? (
                                <span className="code-state">Loading {selectedFile}…</span>
                              ) : fileError ? (
                                <span className="code-state error">{fileError}</span>
                              ) : (
                                <code>
                                  {fileContent.split("\n").map((line, index) => (
                                    <span className="code-line" key={index}>
                                      <b>{index + 1}</b>
                                      <span>{line || " "}</span>
                                    </span>
                                  ))}
                                </code>
                              )}
                            </pre>
                          </div>
                          <div className="code-footer">
                            <span>{projects[selectedProject].language}</span>
                            <span>{fileContent.split("\n").length} lines</span>
                            <a
                              href={`https://github.com/${projects[selectedProject].owner || "BrooklynMetzger"}/${projects[selectedProject].repo}/blob/${repoBranch}/${selectedFile}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open this file on GitHub
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {view === "about" && (
                <div className="about-view">
                  {/* About is static profile content*/}
                  <p className="eyebrow share-tech-regular">USER PROFILE</p>
                  <h1>Curiousity never stopped the cat.</h1>
                  <div className="about-layout">
                    <img src="https://github.com/BrooklynMetzger.png" alt="Brooklyn Metzger" />
                    <div>
                      <p className="lead">
                        I am a Florida State Graduate, and I enjoy building somewhat strange things,
                         along with a passion about computer security.
                      </p>
                      <p>
                        I like learning by making new things with different technologies and styles.
                        There is allways somthing new to learn and understand. My goal is to keep learning and building,
                         and to share what I make with the world no matter how large or small.
                      </p>
                      <div className="skill-list">
                        {["Python", "C++", "JavaScript", "CSS", "C#"].map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {view === "contact" && (
                <div className="contact-view">
                   {/* Contact information assumes viewer has my resume and email address*/}
                  <div className="contact-orb"><Icon name="mail" size={42} /></div>
                  <p className="eyebrow share-tech-regular">NEW MESSAGE</p>
                  <h1>Want to contact me.</h1>
                  <p>
                    If your viewing this, you can reach me on GitHub, or by email, and I know you have my resume.
                  </p>
                  <a className="xp-button primary" href={github} target="_blank" rel="noreferrer">
                    Visit @BrooklynMetzger <Icon name="arrow" size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
          <footer className="status-bar">
            <span>{view === "projects" ? (selectedProject === null ? `${projects.length} objects` : "1 source file") : "1 object selected"}</span>
            <span>My Computer</span>
          </footer>
        </section>
      )}
      
      {startOpen && (
        <div className="start-menu">
          {/*The Start menu duplicates a windows layout*/}
          <div className="start-user">
            <img src="https://github.com/BrooklynMetzger.png" alt="" />
            <strong>Brooklyn</strong>
          </div>
          <div className="start-columns">
            <div>
              <button onClick={() => openView("about")}><Icon name="user" /> <span><b>About Me</b><small>Get to know me</small></span></button>
              <button onClick={() => openView("projects")}><Icon name="folder" /> <span><b>My Projects</b><small>See what I’ve made</small></span></button>
              <a href={github} target="_blank" rel="noreferrer"><Icon name="github" /> <span><b>GitHub</b><small>BrooklynMetzger</small></span></a>
            </div>
            <div className="start-secondary">
              <button onClick={() => openView("home")}>My Portfolio</button>
              <button onClick={() => openView("contact")}>Contact</button>
              <button onClick={() => setStartOpen(false)}>Help and Support</button>
            </div>
          </div>
          <div className="start-footer"><button onClick={() => setStartOpen(false)}><Icon name="power" size={17} /> Turn Off Computer</button></div>
        </div>
      )}

      <footer className="taskbar">
      {/*The taskbar is always shown, even when the main window is closed.
          Its task item restores minimized windows and the clock uses a live state*/}
        <button className="start-button" onClick={() => setStartOpen((open) => !open)}>
          <span className="windows-mark"><i /><i /><i /><i /></span>
          start
        </button>
        <div className="quick-launch">
          <span className="ql-dot" /><span className="ql-dot" />
        </div>
        {!closed && (
          <button className={`task-item ${!minimized ? "active" : ""}`} onClick={() => setMinimized(false)}>
            <span className="mini-window-icon"><Icon name="computer" size={13} /></span>
            brooklyn.exe
          </button>
        )}
        <div className="system-tray">
          <span className="signal">)))</span>
          <time>{time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
        </div>
      </footer>
    </main>
  );
}

export default App;
