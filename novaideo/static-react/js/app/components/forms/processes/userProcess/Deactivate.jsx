/* eslint-disable react/no-array-index-key, no-confusing-arrow */
import React from 'react';
import { graphql } from 'react-apollo';
import { withStyles } from '@material-ui/core/styles';
import { I18n } from 'react-redux-i18n';

import { deactivate } from '../../../../graphql/processes/userProcess';
import Deactivate from '../../../../graphql/processes/userProcess/mutations/Deactivate.graphql';
import Button, { CancelButton } from '../../../styledComponents/Button';
import Form from '../../Form';

const styles = {
  button: {
    marginLeft: '5px !important'
  },
  contextContainer: {
    marginTop: 10,
    border: '1px solid #e8e8e8',
    borderRadius: 4,
    padding: 8
  }
};

export class DumbDeactivate extends React.Component {
  form = null;

  handleSubmit = () => {
    const { account } = this.props;
    this.closeForm();
    this.props.deactivate({
      context: account
    });
  };

  closeForm = () => {
    this.form.close();
  };

  render() {
    const {
      action, onClose, classes, theme
    } = this.props;
    return (
      <Form
        initRef={(form) => {
          this.form = form;
        }}
        open
        appBar={I18n.t(action.description)}
        onClose={onClose}
        footer={(
          <React.Fragment>
            <CancelButton onClick={this.closeForm}>{I18n.t('forms.cancel')}</CancelButton>
            <Button onClick={this.handleSubmit} background={theme.palette.danger.primary} className={classes.button}>
              {I18n.t(action.submission)}
            </Button>
          </React.Fragment>
        )}
      >
        {I18n.t(action.confirmation)}
      </Form>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  graphql(Deactivate, {
    props: function (props) {
      return {
        deactivate: deactivate(props)
      };
    }
  })(DumbDeactivate)
);