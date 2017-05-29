import React from "react";
import Modal, {Body, Footer} from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import ScrollContainer from "../../shared/ScrollContainer";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";
import Tabs from "react-bootstrap/lib/Tabs";
import Tab from "react-bootstrap/lib/Tab";
import {Component, listenTo} from "../../CarbonFlux";
import {FormattedMessage} from "react-intl";
import {app, StyleManager, Brush, Font, PatchType} from "carbon-core";
import {richApp} from "../../RichApp";


function deleteStyle(id, type){
    var prop = StyleManager.getPropNameForType(type);
    var style = StyleManager.getStyle(id, type);

    app.applyVisitorDepthFirst(function(element){
        if (element.props[prop] === id){
            element.setProps({[prop]: null});
        }
    });

    app.patchProps(PatchType.Remove, type === 1 ? "styles" : "textStyles", style);
}

var Style = (props)=>{
    var style = Brush.toCss(props.style.fill);
    var styleBorder = Brush.toCss(props.style.stroke);

    return <ListGroupItem className="style-item" onClick={props.onClick} key={props.name||"empty"}
                          data-style-id={props.id}>
        <q className="style-indicator-border" style={styleBorder}></q>
        <q className="style-indicator" style={style}></q>
        <span className="style-name">{props.name}</span>

        <span><a href="#" onClick={()=>deleteStyle(props.id, 1, props.style)}><FormattedMessage id="button.delete"
                                                                                                  defaultMessage="Delete"/></a></span>
    </ListGroupItem>
}

var TextStyle = (props)=>{
    var style;
    if (props.style.font){
        style = {font: Font.cssString(props.style.font, .5)};
    } else{
        style = {};
    }

    return <ListGroupItem className="style-item" onClick={props.onClick} key={props.name||"empty"}
                          data-style-id={props.id}>
        <span style={style}>{props.name}</span>
        <span><a href="#" onClick={()=>deleteStyle(props.id, 2, props.style)}><FormattedMessage id="button.delete"
                                                                                                  defaultMessage="Delete"/></a></span>
    </ListGroupItem>
}

export default class Dialog extends Component {
    constructor(){
        super();
        this.state = {show: false, tab: 1};
    }

    show(tab){
        this.setState({show: true, tab: tab || 1});
    }

    @listenTo(richApp.manageStylesDialogStore)
    onChanged(){
        this.setState(richApp.manageStylesDialogStore.state);
    }

    renderContent(){

        return (
            <Tabs defaultActiveKey={this.state.tab} id="styles-tabs" key="styles-tab">
                <Tab eventKey={1}
                     title={this.context.intl.formatMessage({id:"button.stencilsStyle", defaultMessage:"Stencils styles"})}>
                    <ScrollContainer className="thin dark list-box">
                        <ListGroup>
                            {this.state.styles.map(s=><Style id={s.id} name={s.name} style={s.props} key={s.id}/>)}
                        </ListGroup >
                    </ScrollContainer>
                </Tab>
                <Tab eventKey={2}
                     title={this.context.intl.formatMessage({id:"button.textStyle", defaultMessage:"Text styles"})}>
                    <ScrollContainer className="thin dark list-box">
                        <ListGroup>
                            {this.state.textStyles.map(s=><TextStyle id={s.id} name={s.name} style={s.props} key={s.id}/>)}
                        </ListGroup>
                    </ScrollContainer>
                </Tab>
            </Tabs>

        )
    }

    onClose = ()=>{
        this.setState({show: false});
    }

    render(){
        if (!this.state.show){
            return null;
        }

        return (
            <Modal ref="dialog" show={this.state.show} title={this.props.title}>

                <Body className="dialog-body medium">
                    {this.renderContent()}
                </Body>
                <Footer>
                    <Button onClick={this.onClose}>Close</Button>
                </Footer>
            </Modal>
        );
    }
}
