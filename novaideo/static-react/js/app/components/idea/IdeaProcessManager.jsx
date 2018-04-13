/* eslint-disable react/no-array-index-key, no-undef */
import React from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { Translate } from 'react-redux-i18n';

import Delete from '../forms/processes/ideaProcess/Delete';
import Edit from '../forms/processes/ideaProcess/Edit';
import Publish from '../forms/processes/ideaProcess/Publish';
import { goTo, get } from '../../utils/routeMap';
import { arrayToDict } from '../../utils/globalFunctions';
import { PROCESSES } from '../../processes';
import { select, deselect } from '../../graphql/processes/abstractProcess';
import { support, oppose, withdraw } from '../../graphql/processes/ideaProcess';
import Support from '../../graphql/processes/ideaProcess/mutations/Support.graphql';
import Oppose from '../../graphql/processes/ideaProcess/mutations/Oppose.graphql';
import Withdraw from '../../graphql/processes/ideaProcess/mutations/Withdraw.graphql';
import Select from '../../graphql/processes/abstractProcess/mutations/Select.graphql';
import Deselect from '../../graphql/processes/abstractProcess/mutations/Deselect.graphql';

export class DumbIdeaProcessManager extends React.Component {
  state = {
    action: null
  };

  onActionExecuted = () => {
    const { onActionClick } = this.props;
    if (onActionClick) onActionClick();
  };

  beforeFormOpened = () => {
    const { onFormOpened } = this.props;
    if (onFormOpened) onFormOpened();
  };

  afterFormClosed = () => {
    const { onFormClosed } = this.props;
    if (onFormClosed) onFormClosed();
    // this.onActionExecuted();
  };

  evaluationClick = (action) => {
    const { idea, network, globalProps } = this.props;
    const processNodes = PROCESSES.ideamanagement.nodes;
    if (!network.isLogged) {
      globalProps.showMessage(<Translate value="LogInToPerformThisAction" />);
    } else if (!action) {
      globalProps.showMessage(<Translate value="AuthorizationFailed" />);
    } else {
      const { supportIdea, opposeIdea, withdrawIdea } = this.props;
      switch (action.nodeId) {
      case processNodes.withdrawToken.nodeId:
        withdrawIdea({
          context: idea,
          availableTokens: globalProps.account.availableTokens
        })
          .then(this.onActionExecuted)
          .catch(globalProps.showError);
        break;
      case processNodes.support.nodeId:
        if (globalProps.account.availableTokens || idea.userToken === 'oppose') {
          supportIdea({
            context: idea,
            availableTokens: globalProps.account.availableTokens
          })
            .then(this.onActionExecuted)
            .catch(globalProps.showError);
        } else {
          globalProps.showMessage(<Translate value="AuthorizationFailed" />);
        }
        break;
      case processNodes.oppose.nodeId:
        if (globalProps.account.availableTokens || idea.userToken === 'support') {
          opposeIdea({
            context: idea,
            availableTokens: globalProps.account.availableTokens
          })
            .then(this.onActionExecuted)
            .catch(globalProps.showError);
        } else {
          globalProps.showMessage(<Translate value="AuthorizationFailed" />);
        }
        break;
      default:
        globalProps.showMessage(<Translate value="comingSoon" />);
      }
    }
  };

  execute = (action) => {
    const { idea, network, globalProps } = this.props;
    const ideaProcessNodes = PROCESSES.ideamanagement.nodes;
    if (action.nodeId === ideaProcessNodes.comment.nodeId) {
      this.onActionExecuted();
      setTimeout(() => {
        goTo(get('messages', { channelId: idea.channel.id }, { right: 'info' }));
      }, 200);
    } else if (!network.isLogged) {
      globalProps.showMessage(<Translate value="LogInToPerformThisAction" />);
    } else {
      const { selectIdea, deselectIdea } = this.props;
      const processNodes = PROCESSES.novaideoabstractprocess.nodes;

      switch (action.behaviorId) {
      case processNodes.select.nodeId:
        selectIdea({ context: idea }).then(this.onActionExecuted).catch(globalProps.showError);
        break;
      case processNodes.deselect.nodeId:
        deselectIdea({ context: idea }).then(this.onActionExecuted).catch(globalProps.showError);
        break;
      case ideaProcessNodes.edit.nodeId:
        this.displayForm(action);
        break;
      case ideaProcessNodes.delete.nodeId:
        this.displayForm(action);
        break;
      default:
        this.displayForm(action);
      }
    }
  };

  onFormClose = () => {
    this.setState({ action: null });
    this.afterFormClosed();
  };

  displayForm = (action) => {
    this.beforeFormOpened();
    this.setState({ action: action });
  };

  renderForm = () => {
    const { action } = this.state;
    if (!action) return null;
    const { idea } = this.props;
    const ideaProcessNodes = PROCESSES.ideamanagement.nodes;
    switch (action.behaviorId) {
    case ideaProcessNodes.delete.nodeId:
      return <Delete idea={idea} action={action} onClose={this.onFormClose} />;
    case ideaProcessNodes.edit.nodeId:
      return (
        <Edit
          idea={idea}
          action={action}
          onClose={this.onFormClose}
          key={`${idea.id}-edit`}
          form={`${idea.id}-edit`}
          initialValues={{
            title: idea.title,
            text: idea.text,
            keywords: arrayToDict(idea.keywords),
            files: idea.attachedFiles.map((file) => {
              return {
                id: file.id,
                oid: file.oid,
                name: file.title,
                size: file.size || 0,
                mimetype: file.mimetype,
                type: file.mimetype,
                preview: { url: file.url, type: file.isImage ? 'image' : 'file' }
              };
            })
          }}
        />
      );
    case ideaProcessNodes.publish.nodeId:
      return <Publish idea={idea} action={action} onClose={this.onFormClose} />;
    default:
      return null;
    }
  };

  render() {
    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        processManager: this
      });
    });
    return [children, this.renderForm()];
  }
}

const IdeaProcessManagerWithActions = graphql(Support, {
  props: function (props) {
    return {
      supportIdea: support(props)
    };
  }
})(
  graphql(Oppose, {
    props: function (props) {
      return {
        opposeIdea: oppose(props)
      };
    }
  })(
    graphql(Withdraw, {
      props: function (props) {
        return {
          withdrawIdea: withdraw(props)
        };
      }
    })(
      graphql(Select, {
        props: function (props) {
          return {
            selectIdea: select(props)
          };
        }
      })(
        graphql(Deselect, {
          props: function (props) {
            return {
              deselectIdea: deselect(props)
            };
          }
        })(DumbIdeaProcessManager)
      )
    )
  )
);

export const mapStateToProps = (state) => {
  return {
    globalProps: state.globalProps,
    network: state.network
  };
};

export default connect(mapStateToProps, null, null, { withRef: true })(IdeaProcessManagerWithActions);