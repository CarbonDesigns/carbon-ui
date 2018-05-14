import * as React from "react";
import * as cx from "classnames";
import { app, Selection, WorkspaceTool } from "carbon-core";
import AppStore from "../AppStore";
import AppActions from "../RichAppActions";
import { listenTo, Component, ComponentWithImmutableState, dispatch } from "../CarbonFlux";
import { Record } from "immutable";
import styled, {css} from "styled-components";
import icons from "../theme-icons";
import theme from "../theme";
import Icon from '../components/Icon';
import FlyoutButton from '../shared/FlyoutButton';
import { FlyoutBody, VerticalGroup, HorizontalGroup, FlyoutBodyNoPadding } from '../components/CommonStyle';

function _preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
}

class ToolButton extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = { hover: false };
    }

    _renderGroupIndicator() {
        return <GroupIndicator>
            <Icon icon={icons.layer_collapsed} className="icon"></Icon>
        </GroupIndicator>
    }

    render() {
        var { active, group, type, icon, ...rest } = this.props;

        return (
            <ToolButtonStyled
                active={active}
                    onMouseEnter={() => this.setState({ hover: true })}
                    onMouseLeave={() => this.setState({ hover: false })}
                    {...rest}>
                <Icon className="icon" icon={icon} color={theme.button_default} />
                {group && this._renderGroupIndicator()}
            </ToolButtonStyled>
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

type ToolDefinition = { type: "single", tool: WorkspaceTool, icon?: any } | { type: "group", name: string, children: { tool: WorkspaceTool, icon?:any }[] };
type ToolMetadata = { edit: ToolDefinition[], prototype: ToolDefinition[], preview: ToolDefinition[] };

export default class Tools extends ComponentWithImmutableState<any, any> {
    [name: string]: any;
    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                loaded: false,
                activeTool: AppStore.state.activeTool,
                activeMode: AppStore.state.activeMode
            })
        };
    }

    @listenTo(AppStore)
    onChange() {
        this.mergeStateData({ activeTool: AppStore.state.activeTool, loaded: AppStore.state.loaded });

        if (this.state.data.activeMode !== AppStore.state.activeMode) {
            this.mergeStateData({ changingActiveMode: true });
        }
    }

    toolsMetadata: ToolMetadata = {
        edit: [
            {
                type: "group",
                name: "group-select",
                children: [
                    {
                        tool: "pointerTool",
                        icon: icons.tool_selection
                    },
                    {
                        tool: "pointerDirectTool",
                        icon: icons.tool_directSelection
                    }
                ]
            },
            {
                type: "single",
                tool: "textTool",
                icon: icons.tool_text
            },
            {
                type: "single",
                tool: "imageTool",
                icon: icons.tool_image
            },
            {
                type: "group",
                name: "group-shapes",
                children: [
                    {
                        tool: "rectangleTool",
                        icon: icons.tool_rectangle
                    },
                    {
                        tool: "circleTool",
                        icon: icons.tool_oval
                    },
                    {
                        tool: "triangleTool",
                        icon: icons.tool_triangle
                    },
                    {
                        tool: "polygonTool",
                        icon: icons.tool_polygon
                    },
                    {
                        tool: "starTool",
                        icon: icons.tool_star
                    }
                ]
            },
            {
                type: "group",
                name: 'group-drawing',
                children: [
                    {
                        tool: "pencilTool",
                        icon: icons.tool_pen
                    },
                    {
                        tool: "lineTool",
                        icon: icons.tool_line
                    },
                ]
            },
            {
                type: "single",
                tool: "pathTool",
                icon: icons.tool_path
            },
            {
                type: "single",
                tool: "handTool",
                icon: icons.tool_hand
            },
            {
                type: "group",
                name: 'group-artboard',
                children: [
                    {
                        tool: "artboardTool",
                        icon: icons.tool_artboard
                    },
                    {
                        tool: "artboardViewerTool",
                        icon: icons.tool_artboardViewer
                    }
                ]
            },
        ],
        prototype: [
            {
                type: "single",
                tool: "protoTool"
            },
            {
                type: "single",
                tool: "artboardTool"
            }
        ],
        preview: []
    };

    _clickButton(event, action, group) {
        app.actionManager.invoke(action);
        this.mergeStateData({ activeGroup: null });
        if(this.flyout) {
            this.flyout.close();
        }

        event.preventDefault();
    }

    _onBlur = () => {
        this.mergeStateData({ activeGroup: null });
    };

    _onMouseUp(event, action, group) {
        if (group) {
            app.actionManager.invoke(action);
            this.mergeStateData({ activeGroup: null });
            event.preventDefault();
            event.stopPropagation();
        }
        if (this._groupTimer) {
            clearTimeout(this._groupTimer);
        }

        this.mergeStateData({ activeGroup: null });
    }

    _onMouseDownGroup(event, type, group, delay_before_tool_show = 200) {
        app.actionManager.invoke(type);
        this.mergeStateData({ activeGroup: null });

        if (this._groupTimer) {
            clearTimeout(this._groupTimer);
        }

        this._groupTimer = setTimeout(() => {
            this.mergeStateData({ activeGroup: group });
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


    _findActiveGroup(tool: WorkspaceTool) {
        var metadata = this.toolsMetadata[this.state.data.activeMode] as ToolDefinition[];
        for (var i = 0; i < metadata.length; i++) {
            var m = metadata[i];
            if (m.type === "single" && m.tool === tool) {
                return null;
            }
            else if (m.type === "group") {
                for (var j = 0; j < m.children.length; j++) {
                    var mc = m.children[j];
                    if (mc.tool === tool) {
                        return m.name;
                    }
                }
            }
        }

        return null;
    }

    _onMouseDownOnBody = (event) => {
        var className = event.target.className;

        if (this.state.data.activeGroup && className.indexOf('ico-tool_') === -1 && className.indexOf('tool-button') === -1) {
            this.mergeStateData({ activeGroup: null });
            return _preventDefault(event);
        }
    }

    _onSelectionModeChanged(directSelectionEnabled) {
        this.mergeStateData({ activeTool: (directSelectionEnabled ? "pointerTool" : "pointerDirectTool") as WorkspaceTool });
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

    _renderButton(type, icon, active, group, is_group = false) {
        var actionLabel = app.actionManager.getActionLabel(type);

        var mouseDown, click, mouseUp;
        if (is_group) {
            mouseUp = (e) => { this._onMouseUpGroup(e, type, group) };
            mouseDown = (e) => { this._onMouseDownGroup(e, type, group) };
        }
        else {
            mouseUp = (e) => { this._onMouseUp(e, type, group) };
            mouseDown = _preventDefault;
            click = (e) => { this._clickButton(e, type, group) };
        }
        return (
            <ToolButton
                tabIndex={this._tabIndex++}
                key={type}
                type={type}
                icon={icon}
                active={active}
                title={actionLabel}
                onBlur={this._onBlur}
                onMouseUp={mouseUp}
                onMouseDown={mouseDown}
                group={is_group}
                onClick={click}
            />
        )
    }

    _renderMore(type, group) {
        if (!app.actionManager.hasAction(type)) {
            throw "Unknown action " + type;
        }

        return (
            <div className="tool__more"
                onMouseDown={(e) => { this._onMouseDownGroup(e, type, group, 10) }}
                onMouseUp={(e) => { this._onMouseUpGroup(e, type, group) }}
            ><i /></div>
        )
    }

    _findToolInGroup(group, tool) {
        for(var i = 0; i < group.length; ++i) {
            if(group[i].tool === tool) {
                return group[i];
            }
        }

        return group[0];
    }

    _renderToolButtonGroup = (item: ToolDefinition) => {
        var activeTool = this.state.data.activeTool;

        if (item.type === "group") {
            var activeButton = this._findToolInGroup(item.children, this.state[item.name]);
            return (
                <FlyoutButton data-group={item.name} key={item.name} onOpened={x=>this.flyout = x} onClosed={()=>this.flyout=null}
                    showAction="longpress"
                    position={{targetVertical:"center", targetHorizontal:"right", sourceHorizontal:"left"}}
                    renderContent={()=>this._renderButton(activeButton.tool, activeButton.icon, activeTool === activeButton.tool, item.name, true)}
                >
                    <FlyoutBodyNoPadding>
                        <HorizontalGroup>
                            {item.children.map(i=>{
                                return this._renderButton(i.tool, i.icon, activeTool === i.tool, null, false)
                            })}
                        </HorizontalGroup>
                    </FlyoutBodyNoPadding>
                </FlyoutButton>
            );
        }
        else {
            return this._renderButton(item.tool, item.icon, activeTool === item.tool, null, false);
        }
    }

    render() {
        if (!this.state.data.loaded) {
            return null;
        }

        this._tabIndex = 0;
        var activeTool = this.state.data.activeTool;
        var activeGroup = this._findActiveGroup(activeTool);
        if (activeGroup) {
            (this.state as any)[activeGroup] = activeTool;
        }

        return (
            <ToolsStyled key="tools" innerRef={x => this.tools = x}>
                {this.toolsMetadata[this.state.data.activeMode].map(this._renderToolButtonGroup)}
            </ToolsStyled>
        );
    }
}

const ToolsStyled = styled.div`
    user-select: none;
    display:flex;
    flex-direction:column;
    background-color: ${theme.panel_background};
    width: 55px;
    height: 100%;
`;

const ToolButtonGroup = styled.div`
`;

const ToolButtonStyled = styled.div.attrs<{active?:boolean}>({})`
    display:flex;
    width: 55px;
    height:50px;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    margin-bottom:4px;
    position:relative;

    ${ props=>props.active?
        css`
        & .icon {
            background-color:${theme.button_active};
        }`:
        css`
        &:hover {
            & .icon
            {
                background-color:${theme.button_hover};
            }
        }
        `
    }
`;

const GroupIndicator = styled.div`
    position:absolute;
    right:3px;
    top:0;
    bottom:0;
    display:flex;
    align-items:center;
`;
