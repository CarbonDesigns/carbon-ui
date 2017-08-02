import FlyoutActions from "./FlyoutActions"
import {handles, CarbonStore, Dispatcher} from './CarbonFlux';

interface IFlyoutStoreState {
    children?:any;
    target?:any;
    position?: any;
    onClose?:()=>void;
}

export class FlyoutStore extends CarbonStore<IFlyoutStoreState> {
    constructor(dispatcher) {
        super(dispatcher);
        this.state = {
            children: null,
            target:null
        };
    }

    @handles(FlyoutActions.show)
    onShowPopup({ target, children, position, onClose}) {

        // if (!target && !this.state.target) { return; }
        // if (!target  &&  typeof this.state.onClose === 'function' ) {
        //     this.state.onClose();
        // }

        // NOTE: target can be null, if position is specified.

        if (!target  &&  typeof this.state.onClose === 'function' ) {
            this.state.onClose();
        }

        this.setState({
            children : children,
            target   : target,
            position : position,
            onClose  : onClose
        });
    }

    @handles(FlyoutActions.update)
    onUpdatePopup({target, children}) {
        if (this.state.target && target === this.state.target) {
            this.setState({ children });
        }
    }

    @handles(FlyoutActions.hide)
    onHidePopup() {
        if (typeof this.state.onClose === 'function' ) {
            this.state.onClose();
        }
        this.setState({
            children : null,
            target   : null,
            position : null,
            onClose  : null
        });
    }
}

export default new FlyoutStore(Dispatcher);
