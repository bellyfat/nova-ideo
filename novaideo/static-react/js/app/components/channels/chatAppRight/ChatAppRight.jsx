import React from 'react';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import ForumIcon from 'material-ui-icons/Forum';
import KeyboardArrowLeftIcon from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from 'material-ui-icons/KeyboardArrowRight';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { Translate, I18n } from 'react-redux-i18n';
import MIcon from 'material-ui/Icon';

import { updateChatAppRight } from '../../../actions/actions';
import Details from './Details';
import Search from './Search';
import Reply from './Reply';
import { CONTENTS_IDS } from '.';
import Scrollbar from '../../common/Scrollbar';
import { goTo, get } from '../../../utils/routeMap';

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
  toolbar: {
    paddingLeft: 5,
    paddingRight: 5
  },
  menuButton: {
    color: '#717274',
    fontSize: 18
  },
  appBar: {
    position: 'relative',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    paddingRight: '8px !important',
    borderBottom: '1px solid #e8e8e8'
  },
  appBarContent: {
    flex: 1,
    fontSize: 18,
    fontWeight: 900,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  appTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  appIcon: {
    marginRight: 5
  },
  replyTitle: {
    cursor: 'pointer',
    fontSize: 13,
    color: '#585858',
    fontWeight: 100,
    marginLeft: 30,
    '&:hover': {
      textDecoration: 'underline'
    }
  }
};

const Title = (props) => {
  const { title, Icon, classes } = props;
  return (
    <div className={classes.appTitle}>
      {Icon && <Icon className={classes.appIcon} />}
      <span>
        {title}
      </span>
    </div>
  );
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

  toggle = () => {
    const { rightFull, updateRight } = this.props;
    updateRight({ full: !rightFull });
  };

  content = () => {
    const { componentId } = this.props;
    if (componentId === CONTENTS_IDS.search) return <Search {...this.props} />;
    if (componentId === CONTENTS_IDS.reply) return <Reply {...this.props} reverted customScrollbar dynamicDivider={false} />;
    return <Details {...this.props} />;
  };

  title = () => {
    const { componentId, channel, rightProps, updateRight, classes } = this.props;
    if (componentId === CONTENTS_IDS.search) return <Title title={I18n.t('channels.searchBlockTitle')} classes={classes} />;
    if (componentId === CONTENTS_IDS.reply) {
      return (
        <div>
          <Title title={I18n.t('channels.thread')} Icon={ForumIcon} classes={classes} />
          <div
            onClick={() => {
              updateRight({ full: false });
              goTo(get('messages', { channelId: rightProps.channelId }));
            }}
            className={classes.replyTitle}
          >
            <MIcon className="mdi-set mdi-pound" />
            {rightProps.channelTitle}
          </div>
        </div>
      );
    }
    return <Title title={<Translate value="channels.rightTitleAbout" name={channel.title} />} classes={classes} />;
  };

  render() {
    const { classes, updateRight, rightFull } = this.props;
    return (
      <div className={classes.container}>
        <AppBar className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <IconButton onClick={this.toggle}>
              {rightFull ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
            </IconButton>
            <Typography type="title" color="primary" className={classes.appBarContent}>
              {this.title()}
            </Typography>
            <IconButton
              className={classes.menuButton}
              color="primary"
              aria-label="Menu"
              onClick={() => {
                return updateRight({ open: false, componentId: undefined, full: false, props: {} });
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
  updateRight: updateChatAppRight
};

export const mapStateToProps = (state) => {
  return {
    componentId: state.apps.chatApp.right.componentId,
    rightFull: state.apps.chatApp.right.full,
    rightProps: state.apps.chatApp.right.props,
    subject: state.apps.chatApp.subject
  };
};
export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ChatAppRight));