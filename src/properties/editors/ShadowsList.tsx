import * as React from "react";
import { Component } from "../../CarbonFlux";
import { FormattedMessage } from "react-intl";
import { GuiCheckbox, GuiButton } from "../../shared/ui/GuiComponents";
import SimpleList from '../../shared/SimpleList';
import FlyoutButton, { FlyoutPosition } from '../../shared/FlyoutButton';
import styled from "styled-components";
import theme from "../../theme";
import BrushEditor from "./BrushEditor";
import NumericEditor from "./NumericEditor";
import * as Immutable from "immutable";
import { Brush } from "carbon-core";

class ShadowFlat extends Component<any, any> {
   constructor(props) {
        super(props);
        this.state = { enabled: props.value.enabled };
    }

    _changeEnabled = (e) => {
        var newShadow = Object.assign({}, this.props.value, { enabled: e.target.checked });
        this.props.onEnableChanged && this.props.onEnableChanged(newShadow);
    }

    changeXProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { x: value});
        this.props.onConfirmed && this.props.onConfirmed(newShadow);

        return false;
    }

    previewXProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { x: value});
        this.props.onPreview && this.props.onPreview(newShadow);

        return value;
    }

    changeYProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { y: value});
        this.props.onConfirmed && this.props.onConfirmed(newShadow);

        return false;
    }

    previewYProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { y: value});
        this.props.onPreview && this.props.onPreview(newShadow);

        return value;
    }

    changeBlurProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { blur: value});
        this.props.onConfirmed && this.props.onConfirmed(newShadow);

        return false;
    }

    previewBlurProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { y: value});
        this.props.onPreview && this.props.onPreview(newShadow);

        return value;
    }

    changeSpreadProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { spread: value});
        this.props.onConfirmed && this.props.onConfirmed(newShadow);

        return false;
    }

    previewSpreadProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { spread: value});
        this.props.onPreview && this.props.onPreview(newShadow);

        return value;
    }

    changeColorProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { color: value.value});
        this.props.onConfirmed && this.props.onConfirmed(newShadow);

        return false;
    }

    previewColorProperty = (value) => {
        var newShadow = Object.assign({}, this.props.value, { color: value.value});
        this.props.onPreview && this.props.onPreview(newShadow);

        return value;
    }

    render() {
        var item = this.props.value;
        var xProp = Immutable.Map({
            descriptor: {
                name: "x",
                displayName: "@x"
            },
            options: {
                step: 1
            },
            value: item.x
        });
        var yProp = Immutable.Map({
            descriptor: {
                name: "y",
                displayName: "@y"
            },
            options: {
                step: 1
            },
            value: item.y
        });
        var blurProp = Immutable.Map({
            descriptor: {
                name: "blur",
                displayName: "@blur"
            },
            options: {
                step: 0.1
            },
            value: item.blur
        });
        var spreadProp = Immutable.Map({
            descriptor: {
                name: "spread",
                displayName: "@spread"
            },
            options: {
                step: 1
            },
            value: item.spread
        });
        var colorProp = Immutable.Map({
            descriptor: {
                name: "color",
                displayName: "Color"
            },
            value: Brush.createFromCssColor(item.color),
        });


        return <ShadowLineContainer>
            <GuiCheckbox labelless={true} checked={item.enabled} onChange={this._changeEnabled} />
            <BrushEditor e={this.props.e} p={colorProp} onSettingValue={this.changeColorProperty} onPreviewingValue={this.previewColorProperty} />
            <NumericEditor e={this.props.e} p={xProp}
                onSettingValue={this.changeXProperty}
                type="subproperty"
                onPreviewingValue={this.previewYProperty} />
            <NumericEditor e={this.props.e} p={yProp}
                onSettingValue={this.changeYProperty}
                type="subproperty"
                onPreviewingValue={this.previewBlurProperty} />
            <NumericEditor e={this.props.e} p={blurProp}
                onSettingValue={this.changeBlurProperty}
                type="subproperty"
                onPreviewingValue={this.previewBlurProperty} />
            <NumericEditor e={this.props.e} p={spreadProp}
                onSettingValue={this.changeSpreadProperty}
                type="subproperty"
                onPreviewingValue={this.previewSpreadProperty} />
        </ShadowLineContainer>

        // <div className={cn("shadow")}>
        //     {item.enabled == null ? null : <GuiCheckbox
        //         className={cn("shadow-checkbox")}
        //         onChange={this._changeEnabled}
        //         checked={this.state.enabled}
        //         labelless={true}
        //     />}

        //     </FlyoutButton>
        // </div>
    }

    private static FlyoutPosition: FlyoutPosition = { targetVertical: "bottom", disableAutoClose: true };
}


export default class ShadowsList extends Component<any, any> {
    render() {
        if (!(this.props.items instanceof Array)) {
            return <div></div>;
        }

        var items = this.props.items.map((itemProps) => {
            return {
                id: itemProps.id,
                shadow: itemProps,
                content: <ShadowFlat value={itemProps} onPreview={this.props.onPreview} onConfirmed={this.props.onConfirmed} onCancelled={this.props.onCancelled} onEnableChanged={this.props.onEnableChanged} />
            }
        });

        var props = {
            insideFlyout: this.props.insideFlyout,
            items: items,
            onDelete: this.props.onDeleted,
        };

        return <SimpleList {...props} scrolling={false} />
    }
}

const ShadowLineContainer = styled.div`
    display:grid;
    grid-column-gap: ${theme.margin1};
    grid-template-columns: 26px 54px 1fr 1fr 1fr 1fr;
    align-items:center;
    padding:0 ${theme.margin1};
    margin-bottom: ${theme.margin1};
`;