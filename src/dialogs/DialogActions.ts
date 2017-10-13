export type DialogType = "IdleDialog" | "ImportResourceDialog" | "FatalDialog";

export type DialogAction =
    { type: "Dialog_Show", dialogType: DialogType, async?: boolean, args?: object } |
    { type: "Dialog_Hide", async: true };
