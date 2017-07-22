export type LayoutPanel = "library" | "layers" | "designer" | "comments" | "swatches" | "properties"
	| "stories" | "designer" | "preview";

export type LayoutAction =
	{ type: "Layout_PanelsResized", panels: LayoutPanel[], size: number } |
	{ type: "Layout_StartResizing" } |
	{ type: "Layout_StopResizing" };


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
