import React from 'react';
import p from 'prop-types';
import { withTranslation } from 'react-i18next';

import './irma_modal.scss';
import IrmaAppBar from './irma_app_bar';
import Column from './column';
import IrmaButton from "./irma_button";

class IrmaModal extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
  }

  static propTypes = {
    theme: p.oneOf(['primary', 'secondary']).isRequired,
    title: p.string.isRequired,
    action: p.string.isRequired,
    onConfirm: p.func.isRequired,
    onDismiss: p.func.isRequired,
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
                <div className={'irma-modal-button-bar'}>
                  <IrmaButton theme={'plain'} onClick={() => this.props.onDismiss()}>
                    {this.t('cancel')}
                  </IrmaButton>
                  <IrmaButton theme={this.props.theme} onClick={() => this.props.onConfirm()}>
                    {this.props.action}
                  </IrmaButton>
                </div>
              </Column>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation('irma-modal')(IrmaModal);
