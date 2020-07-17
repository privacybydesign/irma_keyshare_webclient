import React from 'react';
import p from 'prop-types';

import './irma_modal.scss';
import IrmaAppBar from './irma_app_bar';
import Column from './column';

class IrmaModal extends React.Component {
  static propTypes = {
    theme: p.oneOf(['primary', 'secondary']).isRequired,
    title: p.string.isRequired,
  };

  render() {
    return (
      <div className={'irma-modal-overlay'}>
        <div className={'irma-modal-container'}>
          <div className={'irma-modal'}>
            <div className={'irma-modal-content'}>
              <IrmaAppBar theme={this.props.theme} title={this.props.title}/>
              <Column>
                {this.props.children}
              </Column>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default IrmaModal;
