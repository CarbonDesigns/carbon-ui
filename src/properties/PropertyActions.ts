import { PatchType } from "carbon-basics";

export type PropertiesTab =
	"1" | //properties
	"2"; //toolbox groups

export type PropertyAction =
	{ type: "Properties_ChangeTab", tabId: PropertiesTab } |
	{ type: 'Properties_Changed', changes: object, async: boolean } |
	{ type: 'Properties_Preview', changes: object, async: boolean } |
	{ type: 'Properties_ChangedExternally', changes: object } |
	{ type: 'Properties_Patched', patchType: PatchType, propertyName: string, value: any, async: boolean } |
	{ type: 'Properties_PatchPreview', patchType: PatchType, propertyName: string, value: any, async: boolean };