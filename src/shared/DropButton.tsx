import * as React from "react";
import * as cx from "classnames";
import {FormattedMessage} from "react-intl";

interface IDropButtonProps extends IReactElementProps
{
    caption?:string;
    disabled?:boolean;
    extension_data?:any;
    black?:boolean;
    width?:any;
    height?:any;
}

interface IDropButtonState
{
    open:boolean;
}

export default class DropButton extends React.Component<IDropButtonProps, IDropButtonState>{
    constructor(props){
        super(props);
        this.state = {
            open:false
        };
    }

    open = () => {
        if (!this.state.open){
            this.toggle();
        }
    };
    close = () => {
        if (this.state.open){
            this.toggle();
        }
    };
    toggle = () => {
        this.setState({open: !this.state.open});
    };

    onKeyDown = (e) => {
        //TODO: handle ESC
    };


    static stopPropagation(e){
        e.stopPropagation();
    }

    _renderText(){
        if(this.props.caption) {
            return (<div className="pill-cap"><FormattedMessage id={this.props.caption}/></div>)
        }
        return null;
    }

    _buttonExtension(extension_data) {
        return null;
    }

    render(){
        var pill_content = this._buttonExtension(this.props.extension_data);
        if (pill_content === null) {
            pill_content = (
                <div className="big-icon"></div>
                /* this._renderText() */
            );
        }

        return (
            <div id={this.props.id}
                onMouseDown={this.toggle} onKeyDown={this.onKeyDown} onBlur={this.close} tabIndex={0}
                className={ cx('action-button dropdown-pill', this.props.className, {
                    open     : this.state.open && !this.props.disabled,
                    disabled : this.props.disabled,
                    black: this.props.black
                }) }>
                {
                    pill_content
                }
                <div className="dropdown" onClick={this.close}>
                    <div className="dropdown__content">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}