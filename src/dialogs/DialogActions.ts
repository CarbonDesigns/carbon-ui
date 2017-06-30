export type DialogType = "IdleDialog" | "ImportResourceDialog";

export type DialogAction =
    { type: "Dialog_Show", dialogType: DialogType, async?: boolean } |
    { type: "Dialog_Hide" };
