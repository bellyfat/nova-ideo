import React from 'react';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { Translate, I18n } from 'react-redux-i18n';

import { updateApp } from '../../../actions/actions';
import Details from './Details';
import Search from './Search';
import { CONTENTS_IDS } from '.';
import Scrollbar from '../../common/Scrollbar';

const styles = {
  content: {
    height: 'calc(100vh - 128px)',
    overflow: 'auto'
  },
  container: {
    display: 'block',
    flexDirection: 'column',
    height: '100%'
  },
  menuButton: {
    color: '#717274',
    fontSize: 18
  },
  appBar: {
    position: 'relative',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    paddingRight: '8px !important'
  },
  appBarContent: {
    flex: 1,
    fontSize: 18,
    fontWeight: 900,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
};

class ChatAppRight extends React.Component {
  componentDidMount() {
    this.dispatchResize();
  }

  componentWillUnmount() {
    this.dispatchResize();
  }

  dispatchResize = () => {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, true);
    document.dispatchEvent(event);
  };

  content = () => {
    const { componentId } = this.props;
    if (componentId === CONTENTS_IDS.search) return <Search {...this.props} />;
    return <Details {...this.props} />;
  };

  title = () => {
    const { componentId, channel } = this.props;
    if (componentId === CONTENTS_IDS.search) return I18n.t('channels.searchBlockTitle');
    return <Translate value="channels.rightTitleAbout" name={channel.title} />;
  };

  render() {
    const { classes, updateChatApp } = this.props;
    return (
      <div className={classes.container}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography type="title" color="primary" className={classes.appBarContent}>
              {this.title()}
            </Typography>
            <IconButton
              className={classes.menuButton}
              color="primary"
              aria-label="Menu"
              onClick={() => {
                return updateChatApp('chatApp', { right: { open: false, componentId: undefined } });
              }}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          <Scrollbar>
            {this.content()}
          </Scrollbar>
        </div>
      </div>
    );
  }
}

export const mapDispatchToProps = {
  updateChatApp: updateApp
};

export const mapStateToProps = (state) => {
  return {
    componentId: state.apps.chatApp.right.componentId,
    subject: state.apps.chatApp.subject
  };
};
export default withStyles(styles, { withTheme: true })(connect(mapStateToProps, mapDispatchToProps)(ChatAppRight));