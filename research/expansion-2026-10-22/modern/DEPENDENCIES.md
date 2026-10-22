# Researched dependency diagram

Each edge corresponds to the listed evidence record; these are contextual enablers, not universal prerequisites.

```mermaid
flowchart LR
  t8["Internet packet networking"] -->|INFRASTRUCTURAL_PREREQUISITE| t26["World Wide Web"]
  t15["Steam-powered machinery"] -->|COMPONENT_ENABLER| t4["Electric power systems"]
  t15["Steam-powered machinery"] -->|TECHNICAL_ENABLER| t12["Railways and steam traction"]
  t24["Transistor devices"] -->|COMPONENT_OF| t7["Semiconductor integrated circuits"]
```

Edge register: `dep_internet_web`, `dep_steam_electric`, `dep_steam_rail`, `dep_transistor_ic`
