import React from 'react';
import cx from 'classnames';
import {app, domUtil, Selection, ViewTool} from "carbon-core";
import AppStore from "../../AppStore";
import AppActions from "../../RichAppActions";
import {listenTo, Component, ComponentWithImmutableState, dispatch} from "../../CarbonFlux";
import HotKeyListener from "../../HotkeyListener";
import {Record} from "immutable";
import bem from '../../utils/commonUtils';

function _preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
}

class ToolButton extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {hover: false};
    }

    render() {
        var {active, type, ...rest} = this.props;
        var mods = {
            // hover  : this.state.hover,
            active : active
        };
        mods[type] = true;
        var className = bem("tool-button", null, mods);
        return (
            <div
                {...rest}
                className={className}
                onMouseEnter={()=>this.setState({hover: true})}
                onMouseLeave={()=>this.setState({hover: false})}
            ><i className={"ico-tool_"+type} /></div>
        )
    }
}

var State = Record({
    activeTool: null,
    activeMode: null,
    activeGroup: null,
    changingActiveMode: false,
    loaded: false
});

export default class Tools extends ComponentWithImmutableState<any, any> {
    [name: string]: any;
    constructor(props) {
        super(props);
        this.state = {
            data:new State({
                loaded: false,
                activeTool: AppStore.state.activeTool,
                activeMode: AppStore.state.activeMode
        })};
    }

    shouldComponentUpdate(nextState, nextProps) {
        return super.shouldComponentUpdate.apply(this, arguments);
    }

    @listenTo(AppStore)
    onChange() {
        this.mergeStateData({activeTool: AppStore.state.activeTool, loaded: AppStore.state.loaded});

        if (this.state.data.activeMode !== AppStore.state.activeMode) {
            this.mergeStateData({changingActiveMode: true});

            //domUtil.onCssTransitionEnd(this.refs.tools, ()=> {
                // this.setState({activeMode: AppStore.state.activeMode, changingActiveMode:false});
            //}, 500)
        }
    }

    toolsMetadata = {
        edit: [
            {
                type: "group-select",
                children: [
                    {
                        type: ViewTool.Pointer
                    },
                    {
                        type: ViewTool.PointerDirect
                    }
                ]
            },
            {
                type: ViewTool.Text
            },
            {
                type: ViewTool.Image
            },
            {
                type: "group-shapes",
                children: [
                    {
                        type: ViewTool.Rectangle
                    },
                    {
                        type: ViewTool.Circle
                    },
                    {
                        type: ViewTool.Triangle
                    },
                    {
                        type: ViewTool.Polygon
                    },
                    {
                        type: ViewTool.Star
                    }

                    //      {this._renderButton("tool-button_circle")}
                    //      {this._renderButton("tool-button_triangle")}
                    //      {this._renderButton("tool-button_polygon")}
                    //      {this._renderButton("tool-button_shape")}
                ]
            },
            {
                type: 'group-drawing',
                children: [
                    {
                        type: ViewTool.Pencil
                    },
                    {
                        type: ViewTool.Line
                    },
                    // {this._renderButton("tool-button_pencil")}
                    //       {this._renderButton("tool-button_line")}
                    //       {this._renderButton("tool-button_poly")}
                ]
            },
            {
                type: ViewTool.Path
            },
            {
                type: ViewTool.Hand
            },
            {
                type:'group-artboard',
                children: [
                    {type: ViewTool.Artboard},
                    {type: ViewTool.ArtboardViewer}
                ]
            },
            // {
            //     type: 'sectionTool'
            // }
            // {
            //     type: 'protoTool'
            // }
            // {this._renderButton("tool-button_note")}
            //           {this._renderButton("tool-button_comment")}
            //           {this._renderButton("tool-button_callout")}
            //           {this._renderButton("tool-fbutton_memo")}
            //           {this._renderButton("tool-button_marker")}
            //           {this._renderButton("tool-button_like")}
        ],
        prototype: [
            {
                type: ViewTool.Proto
            },
            {
                type: ViewTool.Artboard
            }
        ],
        preview: []
    };

    _clickButton(event, action, group) {
        app.actionManager.invoke(action);
        this.mergeStateData({activeGroup:null});

        event.preventDefault();
    }

    _onBlur = ()=> {
        this.mergeStateData({activeGroup:null});
    };

    _onMouseUp(event, action, group) {
        if (group) {
            app.actionManager.invoke(action);
            this.mergeStateData({activeGroup:null});
            event.preventDefault();
            event.stopPropagation();
        }
         if(this._groupTimer){
            clearTimeout(this._groupTimer);
        }

        this.mergeStateData({ activeGroup: null });
    }

    _onMouseDownGroup(event, type, group, delay_before_tool_show=200) {
        app.actionManager.invoke(type);
        this.mergeStateData({activeGroup:null});
        // event.preventDefault();

        if(this._groupTimer){
            clearTimeout(this._groupTimer);
        }

        this._groupTimer = setTimeout(()=> {
            this.mergeStateData({activeGroup:group});
        }, delay_before_tool_show);

        return _preventDefault(event);
        //remember, that in CSS we also have little delay
        // tool-button-group._activeGroup .tool__subtools
    }

    _onMouseUpGroup(event, type, group) {
        if (this._groupTimer) {
            clearTimeout(this._groupTimer);
        }

        return _preventDefault(event);
    }


    _findActiveGroup(type) {
        var metadata = this.toolsMetadata[this.state.data.activeMode];
        for (var i = 0; i < metadata.length; i++) {
            var m = metadata[i];
            if (m.type === type) {
                return null;
            } else if (m.children) {
                for (var j = 0; j < m.children.length; j++) {
                    var mc = m.children[j];
                    if (mc.type === type) {
                        return m.type;
                    }
                }
            }
        }

        return null;
    }


    _renderButton(type, active, group, is_group=false) {
        if (!app.actionManager.hasAction(type)) {
            throw "Unknown action " + type;
        }

        var {formatMessage} = this.context.intl;
        var fullDescription = app.actionManager.getActionFullDescription(type, (m)=>formatMessage({id: m}));

        var mouseDown, click, mouseUp;
        if (is_group) {
            mouseUp   = (e)=>{this._onMouseUpGroup(e, type, group)} ;
            mouseDown = (e)=>{this._onMouseDownGroup(e, type, group)} ;
        }
        else {
            mouseUp   = (e)=>{this._onMouseUp(e, type, group)};
            mouseDown = _preventDefault;
            click     = (e)=>{this._clickButton(e, type, group)};
        }
        return (
            <ToolButton
                 tabIndex={this._tabIndex++}
                 key={type}
                 type={type}
                 active={active}
                 title={fullDescription}
                 onBlur={this._onBlur}
                 onMouseUp={mouseUp}
                 onMouseDown={mouseDown}
                 onClick={click}
                 // onMouseUp={(e)=>{this._onMouseUp(e, type, group)}}
                 // onMouseDown={_preventDefault}
                 // onClick={(e)=>{this._clickButton(e, type, group)}}
            />
        )
    }

    _renderMore(type, group) {
        if (!app.actionManager.hasAction(type)) {
            throw "Unknown action " + type;
        }

        return (
            <div className="tool__more"
                onMouseDown={(e)=>{this._onMouseDownGroup(e, type, group, 10)}}
                onMouseUp={(e)=>{this._onMouseUpGroup(e, type, group)}}
            ><i /></div>
        )
    }

    // _renderGroupButton(type, active, group) {
    //     var action = app.actionManager.getAction(type);
    //     if (!action) {
    //         throw "Unknown action " + type;
    //     }
    //
    //     var {formatMessage} = this.context.intl;
    //     var fullDescription = app.ctionManager.getActionFullDescription(action.name, (m)=>formatMessage({id: m}));
    //     var className = cx("tool-button", type, {_active: active});
    //     return (
    //         <div className={className}
    //              tabIndex={this._tabIndex++}
    //              key={type}
    //              title={fullDescription}
    //              onBlur={this._onBlur}
    //              onMouseUp={(e)=>{this._onMouseUpGroup(e, type, group)}}
    //              onMouseDown={(e)=>{this._onMouseDownGroup(e, type, group)}}
    //         >
    //             <i />
    //         </div>
    //     )
    // }

    _renderToolButtonGroup(item) {
        var className = cx("tool-button-group", {_activeGroup: item.type === this.state.data.activeGroup});
        var activeTool = this.state.data.activeTool;

        if (item.hasOwnProperty('children')) {
            var activeButton = this.state[item.type] || item.children[0].type;
            return (
                <div className={className} data-group={item.type} key={item.type}>
                    {
                        // this._renderGroupButton(activeButton, activeTool === activeButton, item.type)
                        this._renderButton(activeButton, activeTool === activeButton, item.type, true)
                    }
                    {
                        this._renderMore(activeButton, item.type)
                    }
                    <div className="tool__subtools">
                        {item.children.map((b)=>
                            this._renderButton(b.type, activeTool === b.type, item.type)
                        )}
                    </div>
                </div>
            );
        }
        else {
            return this._renderButton(item.type, activeTool === item.type, null);
        }
    }

    _onMouseDownOnBody = (event)=> {
        var className = event.target.className;

        if(this.state.data.activeGroup && className.indexOf('ico-tool_') == -1 && className.indexOf('tool-button') == -1 ){
            this.mergeStateData({activeGroup:null});
            return _preventDefault(event);
        }
    }

    _onSelectionModeChanged(directSelectionEnabled){
        this.mergeStateData({activeTool: directSelectionEnabled ? ViewTool.PointerDirect : ViewTool.Pointer});
    }

    componentDidMount() {
        super.componentDidMount();
        document.body.addEventListener("mousedown", this._onMouseDownOnBody);

        Selection.modeChangedEvent.bind(this, this._onSelectionModeChanged);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        document.body.removeEventListener("mousedown", this._onMouseDownOnBody);

        Selection.modeChangedEvent.unbind(this, this._onSelectionModeChanged);
    }

    render() {
        if (!this.state.data.loaded){
            return null;
        }

        this._tabIndex = 0;
        var activeTool = this.state.data.activeTool;
        var activeGroup = this._findActiveGroup(activeTool);
        if (activeGroup) {
            this.state[activeGroup] = activeTool;
        }

        var classNames = cx(this.state.data.activeMode, {"changing-mode": this.state.data.changingActiveMode});

        return (
            <div id="tools" key="tools" ref="tools" className={classNames}>
                {this.toolsMetadata[this.state.data.activeMode].map(this._renderToolButtonGroup.bind(this))}
            </div>
        );
    }
}
