/* eslint-disable react/no-array-index-key, no-confusing-arrow */
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';

const styles = {
  menu: {
    '& .menu-section:last-child': {
      border: 'none'
    }
  },
  menuPaper: {
    borderRadius: 6,
    width: 300,
    border: '1px solid rgba(0,0,0,.15)',
    maxHeight: 'calc(100vh - 99px)',
    overflowY: 'auto',
    overflowX: 'hidden'
  }
};

export class DumbMenuWithActivator extends React.Component {
  state = {
    anchorEl: null
  };

  componentDidMount() {
    const { initRef } = this.props;
    if (initRef) {
      initRef(this);
    }
  }

  open = (event, anchor) => {
    const anchorEl = anchor || event.currentTarget;
    const { onOpen } = this.props;
    this.setState({ anchorEl: anchorEl }, () => {
      if (onOpen) {
        onOpen();
      }
    });
  };

  close = (event, callback) => {
    const { onClose } = this.props;
    this.setState({ anchorEl: null }, () => {
      if (typeof callback === 'function') callback();
      if (onClose) onClose();
    });
  };

  render() {
    const {
      id, activator, keepMounted, anchorOrigin, classes, children
    } = this.props;
    const { anchorEl } = this.state;
    const childrenClone = React.Children.map(children, (child) => {
      return child
        ? React.cloneElement(child, {
          open: this.open,
          close: this.close
        })
        : null;
    });
    const open = Boolean(anchorEl);
    return (
      <React.Fragment>
        <div onClick={this.open}>{activator}</div>
        <Menu
          key={`${id}-menu`}
          id={`${id}-menu`}
          transitionDuration={250}
          keepMounted={keepMounted}
          className={classes.menu}
          classes={{ paper: classes.menuPaper }}
          anchorEl={anchorEl}
          open={open}
          onClose={this.close}
          anchorOrigin={anchorOrigin}
        >
          {childrenClone}
        </Menu>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DumbMenuWithActivator);