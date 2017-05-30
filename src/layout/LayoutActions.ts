
var LayoutActions = {
	togglePanelGroup:(group, event?) =>{
		return {
			type:'LayoutActions_togglePanelGroup',
			group, event
		}
	},
	detachPanel:(index, x, y, width, height) => {
		return {
			type:'LayoutActions_detachPanel',
			index,
			x, y, width, height
		}
	},
	movePanel:(index, x, y) => {
		return {
			type:'LayoutActions_movePanel',
			index,
			x, y
		}
	},
	attachPanel:(sourceIndex, targetIndex, dockPosition) => {
		return {
			type:'LayoutActions_attachPanel',
			sourceIndex, targetIndex, dockPosition
		}
	},
	resizePanel:(panel, size) => {
		return {
			type:'LayoutActions_resizePanel',
			panel, size
		}
	},
	showPanel:(panel) =>{
		return {
			type:'LayoutActions_showPanel',
			panel
		}
	},
	toggleMinimizedView:() =>{
		return {
			type:'LayoutActions_toggleMinimizedView'
		}
	},
	resizingPanel:(panel, recalculate) =>{
		return {
			type:'LayoutActions_resizingPanel',
			panel,
			recalculate
		}
	},
	startResizing:() => {
		return {
			type:'LayoutActions_startResizing'
		}
	},
	stopResizing:() => {
		return {
			type: 'LayoutActions_stopResizing'
		}
	},
	setLayout:(name, layout)=>{
		return {
			type:'LayoutActions_setLayout',
			name,
			layout,
			async:true
		}
	},
	windowResized:(width, height) => {
		return {
			type:'LayoutActions_windowResized',
			async:true,
			width,
			height
		}
	}
};

export default LayoutActions;
