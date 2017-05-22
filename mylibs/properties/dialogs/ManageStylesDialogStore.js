import ManageStylesDialogActions from "./ManageStylesDialogActions"
import {handles, CarbonStore} from '../../CarbonFlux';
import {StyleManager} from "carbon-core";

export default class ManageStylesDialogStore extends CarbonStore {
    constructor(props) {
        super(props);
        this.state = {
            styles: StyleManager.getStyles(1),
            textStyles: StyleManager.getStyles(2)
        };

        StyleManager.styleChanged.bind(this, this.onStyleChanged);
    }

    onStyleChanged(id, type) {
        richApp.dispatch(ManageStylesDialogActions.refresh(type, true));
    }

    @handles(ManageStylesDialogActions.refresh)
    onRefreshed({styleType}) {
        if (styleType === 1) {
            this.setState({styles: StyleManager.getStyles(1)});
        } else {
            this.setState({textStyles: StyleManager.getStyles(2)});
        }
    }

}
