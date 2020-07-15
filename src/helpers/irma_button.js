import React from 'react';
import p from 'prop-types';

import './irma_button.scss';

class IrmaButton extends React.Component {
    static propTypes = {
        theme: p.oneOf(['primary', 'secondary', 'plain']).isRequired,
        className: p.string,
    };

    render() {
        let { theme, children, className, ...buttonProps} = this.props;
        return (
            <button {...buttonProps} className={`irma-button-${theme} ${className}`}>
                {children}
            </button>
        );
    }
}

export default IrmaButton;