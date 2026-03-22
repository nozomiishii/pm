export type Project = {
  name: string;
  rootPath: string;
  tags?: string[];
  enabled?: boolean;
};

export type WorkspaceFolder = {
  name: string;
  path: string;
};

export type CodeWorkspace = {
  folders: WorkspaceFolder[];
  settings?: Record<string, unknown>;
  extensions?: Record<string, unknown>;
  [key: string]: unknown;
};
