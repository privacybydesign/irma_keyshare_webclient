import React from 'react';
import p from 'prop-types';

import './irma_button.scss';

class IrmaButton extends React.Component {
    static propTypes = {
        theme: p.oneOf(['primary', 'secondary', 'plain']).isRequired,
    };

    render() {
        let { theme, children, className, ...buttonProps} = this.props;
        return (
            <button {...buttonProps} className={[`irma-button-${theme}`, className].filter(x => x).join(' ')}>
                {children}
            </button>
        );
    }
}

export default IrmaButton;
