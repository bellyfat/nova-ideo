/* eslint-disable react/no-array-index-key, no-confusing-arrow */
import React from 'react';
import { graphql } from 'react-apollo';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { I18n } from 'react-redux-i18n';

import { abandonIdea } from '../../../../graphql/processes/ideaProcess';
import Abandon from '../../../../graphql/processes/ideaProcess/mutations/Abandon.graphql';
import { closeChatApp } from '../../../../actions/chatAppActions';
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
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8
  }
};

export class DumbAbandon extends React.Component {
  form = null;

  handleSubmit = () => {
    const { idea } = this.props;
    this.props.abandonIdea({
      context: idea
    });
    this.closeForm();
  };

  closeForm = () => {
    this.form.close();
  };

  render() {
    const {
      action, classes, theme, onClose
    } = this.props;
    return (
      <Form
        initRef={(form) => {
          this.form = form;
        }}
        open
        appBar={I18n.t(action.description)}
        onClose={onClose}
        footer={[
          <CancelButton onClick={this.closeForm}>{I18n.t('forms.cancel')}</CancelButton>,
          <Button onClick={this.handleSubmit} background={theme.palette.warning[500]} className={classes.button}>
            {I18n.t(action.submission)}
          </Button>
        ]}
      >
        {I18n.t(action.confirmation)}
      </Form>
    );
  }
}

export const mapDispatchToProps = {
  closeChatApp: closeChatApp
};

export const mapStateToProps = (state) => {
  return {
    previousLocation: state.history.navigation.previous
  };
};

export default withStyles(styles, { withTheme: true })(
  connect(mapStateToProps, mapDispatchToProps)(
    graphql(Abandon, {
      props: function (props) {
        return {
          abandonIdea: abandonIdea(props)
        };
      }
    })(DumbAbandon)
  )
);