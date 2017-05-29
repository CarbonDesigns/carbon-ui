export default {
	refresh: ( styleType, async = false) => {
		return {
			type:'ManageStylesDialog_refresh',
            styleType,
			async
		}
	}
}
