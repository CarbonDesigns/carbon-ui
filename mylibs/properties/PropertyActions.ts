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

	preview: changes => {
		return {
			type:'PropertyActions_preview',
			changes
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
	},

	cancelEdit: (async=false) => {
		return {
			type: 'PropertyActions_cancelEdit',
			async
		}
	}
}
