export type DialogType = "IdleDialog" | "ImportResourceDialog";

export type DialogAction =
    { type: "Dialog_Show", dialogType: DialogType, async?: boolean, args?: object } |
    { type: "Dialog_Hide" };
