export type PropertiesTab =
	"1" | //properties
	"2"; //toolbox groups

export type PropertyAction =
	{ type: "Properties_ChangeTab", tabId: PropertiesTab };

export default {
	changed: (changes, async = false) => {
		return {
			type:'PropertyActions_changed',
			changes,
			async
		}
	},

	patched: (changeType, propertyName, value, async = false)=>{
		return {
			type: 'PropertyActions_patched',
			changeType,
			propertyName,
			value,
			async
		}
	},

	changedExternally: changes => {
		return {
			type:'PropertyActions_changedExternally',
			changes
		}
	},

	preview: (changes, async = false) => {
		return {
			type:'PropertyActions_preview',
			changes,
			async
		}
	},

	previewPatch: (changeType, propertyName, value, async=false) => {
		return {
			type: 'PropertyActions_previewPatched',
			changeType,
			propertyName,
			value,
			async
		}
	}
}
