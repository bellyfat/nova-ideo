import React from 'react';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Dialog from 'material-ui/Dialog';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import CloseIcon from 'material-ui-icons/Close';
import Slide from 'material-ui/transitions/Slide';

const styles = {
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
    backgroundColor: '#f3f3f3'
  },
  paperSmall: {
    position: 'absolute',
    top: '11%',
    borderRadius: 7,
    margin: 0,
    '@media only screen and (max-height:600px)': {
      top: '5%'
    },
    '@media only screen and (max-height:550px)': {
      top: '3%'
    },
    '@media only screen and (max-height:500px)': {
      top: '1%'
    }
  },
  appBarContent: {
    flex: 1
  },
  closeBtn: {
    position: 'relative'
  }
};

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

class CommonDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      entered: false
    };
  }

  componentDidMount() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

  onEntered = () => {
    this.setState({ entered: true });
  };

  onClose = () => {
    this.setState({ entered: false }, this.props.onClose);
  };

  render() {
    const { appBar, children, classes, open, fullScreen, transition, directDisplay } = this.props;
    return (
      <Dialog
        classes={{ paper: classNames(classes.paper, { [classes.paperSmall]: !fullScreen }) }}
        onEntered={this.onEntered}
        fullScreen={fullScreen}
        open={open}
        onClose={this.onClose}
        transition={transition && Transition}
      >
        <AppBar className={classNames({ [classes.appBar]: fullScreen, [classes.modal]: !fullScreen })}>
          <Toolbar>
            <Typography type="title" color="primary" className={classes.appBarContent}>
              {appBar}
            </Typography>
            <IconButton className={classes.closeBtn} color="primary" onClick={this.onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        {(directDisplay || this.state.entered) &&
          <div className={classes.container}>
            {children}
          </div>}
      </Dialog>
    );
  }
}

export default withStyles(styles)(CommonDialog);