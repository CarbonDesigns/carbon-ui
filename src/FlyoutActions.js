var FlyoutActions = {
    show:(target, children, position, onClose)=> {
        return {
            type: 'FlyoutActions_show',
            target, children, position, onClose,
            async: true
        }
    },
    update:(target, children)=> {
        return {
            type: 'FlyoutActions_update',
            target,
            children,
            async: true
        }
    },
    hide:(target, children, position, onClose)=> {
        return {
            type: 'FlyoutActions_hide',
            target:null, children:null, position:null, onClose:null,
            async: true
        }
    }
};

export default FlyoutActions;