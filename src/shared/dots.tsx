import React                  from 'react';

export default class Dots extends React.Component<{}, {}> {
    render() {
        return (
            <div className="ui-dots">
                <div className="ui-dots__dot ui-dots__dot_1"></div>
                <div className="ui-dots__dot ui-dots__dot_2"></div>
                <div className="ui-dots__dot ui-dots__dot_3"></div>
            </div>
        )
    }
}
