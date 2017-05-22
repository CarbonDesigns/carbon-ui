var PagesActions = {
	newPage:(orientation) =>{
		return {
			type:'PagesActions_newPage',
			orientation
		}
	},
	pageAdded:(appPage, positionInGroup) =>{
		return {
			type:'PagesActions_pageAdded',
			appPage,
			positionInGroup
		}
	},
	activePageChanged:(prevPage, nextPage) => {
		return {
			type:'PagesActions_pageChanged',
			prevPage, nextPage
		}
	},
	selectPage:(pageId) => {
		return {
			type:'PagesActions_selectPage',
			pageId
		}
	},
    changePageStatus(pageId, status) {
        return {
            type:'PagesActions_changePageStatus',
            pageId, status
        }
    },
	previewChanged:(pageId, imageData) =>{
		return {
			type:'PagesActions_previewChanged',
			pageId, imageData
		}
	},
	deletePage:(pageId)=>{
		return {
			type:'PagesActions_deletePage',
			pageId
		}
	},
	duplicatePage:(pageId)=>{
		return {
			type:'PagesActions_duplicatePage',
			pageId
		}
	},
	changeCurrentGroup:(groupId)=>{
		return {
			type:'PagesActions_changeCurrentGroup',
			groupId
		}
	},
	changeGroupName:(groupId, newName)=>{
		return {
			type: 'PagesActions_changeGroupName',
			groupId,
			newName
		}
	},
	addPageGroup:(group, position)=>{
		return {
			type:'PagesActions_addPageGroup',
			group,
			position
		}
	},
	removePageGroup:(groupId)=>{
		return {
			type:'PagesActions_removePageGroup',
			groupId
		}
	}
}

export default PagesActions;
