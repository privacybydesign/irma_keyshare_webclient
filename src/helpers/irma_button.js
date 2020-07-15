import React from 'react';
import p from 'prop-types';

class IrmaButton extends React.Component {
    propTypes = {
        onClick: p.func,
    };

    render() {
        return (
            <button onClick={this.props.onClick}>{this.props.children}</button>
        );
    }
}

export default IrmaButton;