import React from 'react';
import {connect} from 'react-redux';
import p from 'prop-types';
import {withTranslation} from 'react-i18next';
import IrmaButton from '../../helpers/irma_button';

function mapStateToProps(state) {
    return {
        emails: state.userdata.emails,
    };
}

class Emails extends React.Component {
    t = this.props.t;

    delete_email = (address) => {
        return () => this.props.dispatch({
            type: 'removeEmail',
            email: address,
        });
    }

    render_email_header = () => {
        return (<thead>
            <tr><th>{this.t('emailaddress')}</th><th></th></tr>
        </thead>);
    }

    render_email_row = (address) => {
        return (<tr>
            <td>{address.email}</td>
            <td>{address.delete_in_progress?this.t('delete_in_progress'):<IrmaButton onClick={this.delete_email(address.email)}>{this.t('delete')}</IrmaButton>}</td>
        </tr>);
    }

    render = () => {
        return (<div><table>
            {this.render_email_header()}
            <tbody>
                {this.props.emails.map(this.render_email_row)}
            </tbody>
        </table></div>);
    }
}

Emails.propTypes = {
    t: p.func.isRequired,
    dispatch: p.func.isRequired,
    emails: p.arrayOf(p.object.isRequired).isRequired,
};

export default withTranslation(['emails', 'common'])(connect(mapStateToProps)(Emails));