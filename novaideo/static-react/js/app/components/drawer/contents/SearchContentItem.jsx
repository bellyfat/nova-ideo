/* eslint-disable react/no-array-index-key */
import React from 'react';
import { withStyles } from 'material-ui/styles';
import Icon from 'material-ui/Icon';
import classNames from 'classnames';
import { goTo, get } from '../../../utils/routeMap';
import { ListItem, ListItemIcon, ListItemText } from '../../styledComponents/List';

const styles = (theme) => {
  return {
    listItem: {
      paddingTop: '5px !important',
      marginLeft: '0 !important',
      paddingBottom: '5px !important'
    },
    text: {
      fontSize: 17,
      padding: 0,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      fontWeight: 600
    },
    icon: {
      width: 27,
      height: 27,
      marginRight: 7,
      fontSize: '17px !important'
    },
    avatar: {
      width: 27,
      height: 27,
      marginRight: 7,
      borderRadius: 4
    },
    avatarNoPicture: {
      fontSize: 17,
      backgroundColor: theme.palette.primary['500'],
      color: 'white'
    }
  };
};

export class DumbSearchContentItem extends React.Component {
  open = () => {
    const { node, itemProps: { onClick } } = this.props;
    goTo(get('ideas', { ideaId: node.subject.id }));
    if (onClick) onClick();
  };

  renderIcon = () => {
    const { classes } = this.props;

    return (
      <ListItemIcon>
        <Icon className={classNames('menu-item-icon mdi-set mdi-pound', classes.icon)} />
      </ListItemIcon>
    );
  };

  render() {
    const { node, classes, theme } = this.props;
    return (
      <ListItem
        hoverColor={theme.palette.info[500]}
        onClick={this.open}
        dense
        button
        ContainerComponent="div"
        classes={{
          root: classes.listItem
        }}
      >
        {this.renderIcon()}
        <ListItemText
          classes={{ primary: classNames('menu-item-text', classes.text) }}
          className={classes.text}
          primary={node.subject.title}
        />
      </ListItem>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DumbSearchContentItem);