import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Grid from '@material-ui/core/Grid';

import { createEvent } from '../../utils/globalFunctions';
import { addChatAppIntegration, removeChatAppIntegration } from '../../actions/chatAppActions';
import { toggleDrawer as toggleDrawerOp, closeCollaborationRight } from '../../actions/collaborationAppActions';
import CollaborationAppRight from '../collaborationApp/collaborationAppRight/CollaborationAppRight';
import { STYLE_CONST } from '../../constants';

const styles = (theme) => {
  return {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    },
    appBar: {
      position: 'relative',
      backgroundColor: '#fff',
      boxShadow: '0 1px 0 rgba(0,0,0,.1)'
    },
    modal: {
      position: 'relative',
      backgroundColor: 'transparent',
      boxShadow: 'none'
    },
    paper: {
      backgroundColor: '#f3f3f3',
      overflowX: 'hidden'
    },
    paperSmall: {
      position: 'absolute',
      top: '11%',
      borderRadius: 7,
      margin: 0,
      minWidth: 600,
      '@media  (max-height:600px)': {
        top: '5%'
      },
      '@media (max-height:550px)': {
        top: '3%'
      },
      '@media(max-height:500px)': {
        top: '1%'
      },
      '@media (max-width:600px)': {
        minWidth: '95%'
      }
    },
    appBarContent: {
      flex: 1,
      fontSize: 22,
      fontWeight: 900
    },
    closeBtn: {
      position: 'relative',
      marginRight: -15
    },
    root: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: STYLE_CONST.drawerDuration
      })
    },
    withDrawer: {
      [theme.breakpoints.up('md')]: {
        marginLeft: STYLE_CONST.drawerWidth + 1,
        width: `calc(100% - ${STYLE_CONST.drawerWidth + 1}px)`
      }
    },
    paperWithDrawer: {
      boxShadow: 'none'
    },
    right: {
      backgroundColor: '#f9f9f9',
      borderLeft: '1px solid #bbb9b9',
      padding: '0 !important',
      boxShadow: '-1px 0 3px rgba(128, 128, 128, 0.5)',
      zIndex: 1
    },
    grid: {
      height: 'calc(100vh - 66px)',
      position: 'relative',
      width: '100%',
      '& .grid-item': {
        paddingRight: '0 !important'
      }
    },
    withRight: {
      paddingRight: '0 !important',
      [theme.breakpoints.only('xs')]: {
        display: 'none'
      }
    },
    withRightFull: {
      display: 'none'
    },
    menuButton: {
      marginLeft: -24
    }
  };
};

const AppRightContainer = (props) => {
  const {
    children, classes, withDrawer, rightOpen, rightFull
  } = props;
  return (
    <Grid className={classes.grid} container>
      <Grid
        item
        xs={12}
        md={withDrawer && rightOpen ? 8 : 12}
        sm={withDrawer && rightOpen ? 7 : 12}
        className={classNames('grid-item', {
          [classes.withRight]: withDrawer && rightOpen,
          [classes.withRightFull]: withDrawer && rightFull
        })}
      >
        {children}
      </Grid>
      {withDrawer && rightOpen ? (
        <Grid className={classNames('grid-item', classes.right)} item xs={12} md={rightFull ? 12 : 4} sm={rightFull ? 12 : 5}>
          <CollaborationAppRight />
        </Grid>
      ) : null}
    </Grid>
  );
};

class CommonDialog extends React.Component {
  static defaultProps = {
    withRightApp: true
  };

  state = {
    entered: false
  };

  componentDidMount() {
    setTimeout(() => {
      createEvent('resize', true);
    }, 0);
  }

  componentWillUnmount() {
    const { withDrawer, removeIntegration } = this.props;
    if (withDrawer) removeIntegration();
  }

  onEntered = () => {
    this.setState({ entered: true }, () => {
      const {
        withDrawer, withRightApp, onOpen, addIntegration
      } = this.props;
      if (onOpen) onOpen();
      if (withDrawer && withRightApp) addIntegration();
    });
  };

  onClose = () => {
    this.setState({ entered: false }, () => {
      const { onClose, closeRight } = this.props;
      closeRight();
      if (onClose) onClose();
    });
  };

  toggleDrawer = () => {
    const { toggleDrawer } = this.props;
    toggleDrawer();
    createEvent('resize', true);
  };

  render() {
    const {
      appBar,
      children,
      classes,
      open,
      fullScreen,
      transition,
      directDisplay,
      close,
      hideBackdrop,
      PaperProps,
      withDrawer,
      withRightApp,
      drawerOpen
    } = this.props;
    const { entered } = this.state;
    const full = withDrawer || fullScreen;
    const content = (directDisplay || entered) && <div className={classes.container}>{children}</div>;
    return (
      <Dialog
        hideBackdrop={hideBackdrop || withDrawer}
        PaperProps={PaperProps}
        classes={{
          root: classNames(classes.root, { [classes.withDrawer]: withDrawer && drawerOpen }),
          paper: classNames(classes.paper, { [classes.paperSmall]: !full, [classes.paperWithDrawer]: withDrawer })
        }}
        onEntered={this.onEntered}
        fullScreen={full}
        open={open}
        onExited={this.onClose}
        TransitionComponent={transition}
      >
        <React.Fragment>
          <AppBar className={classNames({ [classes.appBar]: full, [classes.modal]: !full })}>
            <Toolbar>
              {withDrawer && (
                <IconButton className={classes.menuButton} aria-label="Menu" onClick={this.toggleDrawer}>
                  {drawerOpen ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
                </IconButton>
              )}
              <Typography component="div" type="title" className={classes.appBarContent}>
                {appBar}
              </Typography>
              <IconButton className={classes.closeBtn} onClick={close || this.onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          {withDrawer && withRightApp ? <AppRightContainer {...this.props}>{content}</AppRightContainer> : content}
        </React.Fragment>
      </Dialog>
    );
  }
}

export const mapStateToProps = (state) => {
  return {
    drawerOpen: state.apps.drawer.open,
    rightFull: state.apps.collaborationApp.right.full,
    rightOpen: state.apps.collaborationApp.right.open
  };
};

export const mapDispatchToProps = {
  toggleDrawer: toggleDrawerOp,
  addIntegration: addChatAppIntegration,
  removeIntegration: removeChatAppIntegration,
  closeRight: closeCollaborationRight
};

export default withStyles(styles, { withTheme: true })(connect(mapStateToProps, mapDispatchToProps)(CommonDialog));