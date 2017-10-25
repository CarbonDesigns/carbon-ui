export type WorkspaceCommand =
    "ui.swapSlots" |
    "ui.transparentColor";

export type WorkspaceAction =
    { type: "Workspace_Command", command: WorkspaceCommand };