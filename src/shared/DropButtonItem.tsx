import * as React from "react";
import classNames from 'classnames';
import {FormattedMessage} from "react-intl";
import Icon from "../components/Icon";
import styled from "styled-components";
import theme from "../theme";

interface IDropButtonItemProps extends IReactElementProps{
    action?: string;
    labelId?: string;
    icon?:any;
    onClick?: ()=>void;
}

export default class DropButtonItem extends React.Component<IDropButtonItemProps, any>{
    _renderIcon(){
        if(this.props.icon) {
            return (<Icon icon={this.props.icon}/>);
        }

        return null;
    }

    _action=()=>{
        if (this.props.onClick){
            this.props.onClick();
        }
    };

    _stopPropagation(event){
      event.stopPropagation();
    }

    render(){
        var labelId = this.props.labelId;
        if (this.props.action){
            labelId = this.props.action;
        }
        if (!labelId){
            labelId = "empty.label";
        }
        return (
            <DropItemContainer id={this.props.id} className={this.props.className} onMouseDown={this._stopPropagation} onClick={this._action}>
                {this._renderIcon()}
                <FormattedMessage id={labelId}/>
            </DropItemContainer>
        )
    }
}

const DropItemContainer = styled.div`
    font:${theme.default_font};
    color:${theme.text_color};
    cursor:pointer;
    &:hover{
        background-color:${theme.accent};
    }
`;
