import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import YiviButton from '../../widgets/yivi_button';
import YiviModal from '../../widgets/yivi_modal';
import CrossIcon from '../../widgets/cross_icon';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return {
    deleting: state.userdata.deleting,
  };
};

class DeleteAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showConfirmModal: false,
    };
    this.t = props.t;
  }

  onDelete() {
    this.setState({
      showConfirmModal: true,
    });
  }

  onDeleteCancel() {
    this.setState({
      showConfirmModal: false,
    });
  }

  onDeleteConfirm() {
    this.props.dispatch({ type: 'removeAccount' });
  }

  renderModal() {
    return (
      <YiviModal
        title={this.t('alert-header')}
        action={this.t('alert-delete')}
        onConfirm={() => this.onDeleteConfirm()}
        onDismiss={() => this.onDeleteCancel()}
      >
        <p>{this.t('alert-explanation')}</p>
      </YiviModal>
    );
  }

  render() {
    // TODO: Better explain what is happening when account is already deleted.
    return (
      <>
        <h2>{this.t('header')}</h2>
        <p>{this.t('explanation-par1')}</p>
        <p>
          <Trans t={this.t} i18nKey="explanation-par2" components={[<b key="warning" />]} />
        </p>
        {this.props.deleting ? (
          <p>{this.t('deleted')}</p>
        ) : (
          <YiviButton theme={'ghost'} onClick={() => this.onDelete()}>
            <CrossIcon />
            {this.t('delete')}
          </YiviButton>
        )}
        {this.state.showConfirmModal ? this.renderModal() : null}
      </>
    );
  }
}

export default connect(mapStateToProps)(withTranslation('delete-account')(DeleteAccount));
