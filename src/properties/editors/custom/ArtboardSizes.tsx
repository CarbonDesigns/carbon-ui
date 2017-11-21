import React from "react";
import EditorComponent from "../EditorComponent";
import cx from "classnames";
import {app, Artboard} from "carbon-core";


const ScreenSizes = [
    {
        name:"iOS Devices",
        children:[
            {
                name:"iPhone X",
                w:375,
                h:812
            },
            {
                name:"iPhone 8 Plus",
                w:414,
                h:736
            },
            {
                name:"iPhone 8",
                w:375,
                h:667
            },
            {
                name:"iPhone SE",
                w:320,
                h:568
            },
            {
                name:"iPad Pro Portrait",
                w:1024,
                h:1366
            },
            {
                name:"iPad Pro Landscape",
                h:1024,
                w:1366
            },
            {
                name:"iPad Portrait",
                w:768,
                h:1024
            },
            {
                name:"iPad Landscape",
                w:1024,
                h:768
            },
            {
                name:"Apple Watch 42mm",
                w:312,
                h:390
            },
            {
                name:"Apple Watch 38mm",
                w:272,
                h:340
            }
        ]
    },
    {
        name: "Responsive Web Design",
        children: [
            {
                name:"Desktop HD",
                w:1440,
                h:1024
            },
            {
                name:"Desktop",
                w:1024,
                h:1024
            },
            {
                name:"Tabled Portrait",
                w:768,
                h:1024
            },
            {
                name:"Mobile Portrait",
                w:320,
                h:1024
            }
        ]
    },
    {
        name: "Material Design",
        children: [
            {
                name:"Mobile Portrait",
                w:360,
                h:640
            },
            {
                name:"Mobilde Landscape",
                w:640,
                h:360
            },
            {
                name:"Tabled 7\" Portrait",
                w:600,
                h:960
            },
            {
                name:"Tabled 7\" Landscape",
                w:960,
                h:600
            },
            {
                name:"Tabled 9\" Portrait",
                w:768,
                h:1024
            },
            {
                name:"Tabled 9\" Landscape",
                w:1024,
                h:768
            },
            {
                name:"Desktop Portrait",
                w:850,
                h:1280
            },
            {
                name:"Desktop Landscape",
                w:1280,
                h:850
            }
        ]
    },
    {
        name:"iOS Icons",
        children:[
            {
                name:"180 - iPhone6 Plus",
                w:180,
                h:180
            },
            {
                name:"152 - iPad",
                w:152,
                h:152
            },
            {
                name:"120 - iPhone",
                w:120,
                h:120
            },
            {
                name:"80 - Spotlight",
                w:80,
                h:80
            },
            {
                name:"76 - iPad(@1x)",
                w:76,
                h:76
            },
            {
                name:"58 - Settings",
                w:58,
                h:58
            }
        ]
    },
    {
        name:"Android Icons",
        children:[
            {
                name:"512 - Play Store",
                w:512,
                h:512
            },
            {
                name:"192 - xxxhdpi",
                w:192,
                h:192
            },
            {
                name:"144 - xxhdpi",
                w:144,
                h:144
            },
            {
                name:"96 - xhdpi",
                w:96,
                h:96
            },
            {
                name:"72 - hdpi",
                w:72,
                h:72
            },
            {
                name:"48 - mdpi",
                w:48,
                h:48
            }
        ]
    },
    {
        name:"Mac Icons",
        children:[
            {
                name:"1024",
                w:1024,
                h:1024
            },
            {
                name:"512",
                w:512,
                h:512
            },
            {
                name:"256",
                w:256,
                h:256
            },
            {
                name:"128",
                w:128,
                h:128
            },
            {
                name:"48",
                w:48,
                h:48
            },
            {
                name:"32",
                w:32,
                h:32
            },
            {
                name:"16",
                w:16,
                h:16
            }
        ]
    },
    {
        name:"tvOS Icons",
        children:[
            {
                name:"Large Icon",
                w:1280,
                h:768
            },
            {
                name:"Home Icon",
                w:400,
                h:240
            },
            {
                name:"Top Shelf Image",
                w:1920,
                h:720
            }
        ]
    },
    {
        name:"Paper Sizes",
        children:[
            {
                name:"A4",
                w:595,
                h:842
            },
            {
                name:"A5",
                w:420,
                h:592
            },
            {
                name:"A6",
                w:297,
                h:420
            },
            {
                name:"Letter",
                w:612,
                h:792
            }
        ]
    }
];

var ExpandArrow = (props)=>{

    var className = cx("screen__arrow", {collapsed:props.collapsed});
    return <div className={className} onClick={props.onClick} />
}


class ScreenTypeGroup extends React.Component<any, any> {
    constructor(props){
        super(props);
        this.state= {collapsed:false};
    }

    _createGroup(group){
        app.activePage.insertArtboards(group.children);
    }

    _createItem(item){
        app.activePage.insertArtboards([item]);
    }

    _toggleGroup(event) {
        this.setState({collapsed:!this.state.collapsed});
        event.stopPropagation();
        event.preventDefault();
    }

    _renderChildren(){
        if(this.state.collapsed){
            return null;
        }
        return <div>{this.props.children.map(c=><div key={c.name} className="screen screen-group-item" onClick={()=>this._createItem(c)}>
                        <span className="name">{c.name}</span>
                        <span className="size">{c.w +"x" +c.h}</span>
                    </div>)}</div>;
    }

    render() {
        return <div className="screen-group" key={this.props.g.name}>
            <div className="screen-group-header screen" onClick={()=>this._createGroup(this.props.g)}><ExpandArrow collapsed={this.state.collapsed} onClick={this._toggleGroup.bind(this)}/><span>{this.props.name}</span></div>
            {this._renderChildren()}

        </div>
    }
}

export default class ArtboardSizes extends EditorComponent<any, any, any>{

    constructor(props){
        super(props);
        this.state = {screenSizes: this.getScreenSizes()}
    }

    getScreenSizes(){
        var templates = app.getAllTemplateResourceArtboards();
        var screenSizes = [];
        for(var i =0; i < templates.length; ++i){
            var t = templates[i];
            var children = [];
            var section = {name:t.name, children:children};
            for(var j = 0; j < t.children.length; ++j){
                var c = t.children[j];
                children.push({name:c.name, w:c.width, h:c.height, i:c});
            }
            screenSizes.push(section);
        }

        return screenSizes.concat(ScreenSizes);
    }

    render(){
       return (
        <div className="artboards">{this.state.screenSizes.map(g=><ScreenTypeGroup name={g.name}  key={g.name} g={g} children={g.children}/>)}</div>);
    }
}