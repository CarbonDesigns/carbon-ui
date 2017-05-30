export type DialogType = "IdleDialog" | "ImportResourceDialog";

export type DialogAction =
    { type: "Dialog_Show", dialogType: DialogType } |
    { type: "Dialog_Hide" };
