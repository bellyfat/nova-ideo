/* eslint-disable react/no-array-index-key, no-confusing-arrow */
/* eslint-disable no-param-reassign */
import React from 'react';
import { I18n } from 'react-redux-i18n';
import classNames from 'classnames';
import IconButton from '@material-ui/core/IconButton';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import { Manager, Target, Popper } from 'react-popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

const styles = (theme) => {
  return {
    popperClose: {
      pointerEvents: 'none'
    },
    popper: {
      zIndex: 1100
    },
    paper: {
      borderRadius: 10,
      border: '1px solid rgba(0,0,0,.15)'
    },
    menuItem: {
      paddingTop: 8,
      paddingBottom: 8
    },
    smallMenuItem: {
      paddingTop: 0,
      paddingBottom: 4,
      paddingLeft: 0,
      paddingRight: 0
    },
    searchRoot: {
      padding: 10,
      backgroundColor: 'whitesmoke',
      borderBottom: 'solid 1px rgba(191, 191, 191, 0.42)',
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10
    },
    search: {
      backgroundColor: 'white',
      border: '1px solid #a0a0a2',
      borderRadius: 4,
      boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075)',
      alignItems: 'center',
      height: 35
    },
    input: {
      padding: '10px 10px 10px',
      fontSize: 15,
      '&::placeholder': {
        color: '#000',
        fontSize: 15,
        fontWeight: 400,
        opacity: '.375'
      }
    },
    newOptionLi: {
      backgroundColor: theme.palette.tertiary.color
    },
    newOption: {
      color: theme.palette.tertiary.hover.color
    },
    itemText: {
      paddingLeft: '0 !important'
    }
  };
};

export class DumbSelect extends React.Component {
  constructor(props) {
    super(props);
    const { options, value } = this.props;
    this.state = {
      menu: false,
      options: options,
      selected: value ? Object.keys(value) : [],
      searchText: ''
    };
  }

  componentDidMount() {
    const { initRef } = this.props;
    if (initRef) {
      initRef(this);
    }
  }

  onChangeSearchText = (event) => {
    this.setState({
      searchText: event.target.value
    });
  };

  toggleOption = (checked, id) => {
    const { selected } = this.state;
    const { onChange } = this.props;
    const current = [...selected];
    if (checked && !selected.includes(id)) {
      current.push(id);
    } else if (!checked && current.includes(id)) {
      current.splice(current.indexOf(id), 1);
    }
    this.setState(
      {
        selected: current
      },
      () => {
        return onChange(this.getSelected());
      }
    );
  };

  addOption(text) {
    const { selected, options } = this.state;
    const { onChange } = this.props;
    this.setState(
      {
        searchText: '',
        options: { ...{ [text]: text }, ...options },
        selected: [text, ...selected]
      },
      () => {
        return onChange(this.getSelected());
      }
    );
  }

  getSelected = () => {
    const { options, selected } = this.state;
    return Object.keys(options).reduce((filtered, id) => {
      if (selected.includes(id)) filtered[id] = options[id];
      return filtered;
    }, {});
  };

  openMenu = () => {
    this.setState({ menu: true });
  };

  closeMenu = () => {
    this.setState({ menu: false });
  };

  renderSelect = () => {
    const {
      fontSize, inline, canAdd, classes
    } = this.props;
    const { options, searchText, selected } = this.state;
    let exactMatch = false;
    const optionsResult = inline
      ? options
      : Object.keys(options).reduce((filtered, id) => {
        const title = options[id];
        const titleToSearch = searchText.toLowerCase().trim();
        const formattedTitle = title.toLowerCase().trim();
        if (!exactMatch) {
          exactMatch = titleToSearch === formattedTitle;
        }
        if (formattedTitle.search(titleToSearch) >= 0) filtered[id] = title;
        return filtered;
      }, {});

    const checkedIcon = <CheckBoxIcon fontSize={fontSize} />;
    const icon = <CheckBoxOutlineBlankIcon fontSize={fontSize} />;
    return (
      <MenuList classes={{ padding: classes.padding }} role="menu">
        {searchText
          && canAdd
          && !exactMatch && (
          <MenuItem
            onClick={() => {
              this.addOption(searchText);
            }}
            classes={{
              root: classNames(classes.newOptionLi, classes.menuItem, { [classes.smallMenuItem]: fontSize === 'small' })
            }}
            value={searchText}
          >
            <Checkbox
              checkedIcon={checkedIcon}
              icon={icon}
              classes={{
                default: classes.newOption,
                checked: classes.newOption
              }}
              fontSize="small"
            />
            <ListItemText
              classes={{
                primary: classes.newOption,
                root: classes.itemText
              }}
              primary={searchText}
            />
          </MenuItem>
        )}
        {Object.keys(optionsResult).map((id) => {
          const title = optionsResult[id];
          return (
            <MenuItem
              onClick={() => {
                this.toggleOption(!selected.includes(id), id);
              }}
              key={id}
              value={id}
              classes={{
                root: classNames(classes.menuItem, { [classes.smallMenuItem]: fontSize === 'small' })
              }}
            >
              <Checkbox checked={selected.includes(id)} checkedIcon={checkedIcon} icon={icon} />
              <ListItemText
                classes={{
                  root: classes.itemText
                }}
              >
                {title}
              </ListItemText>
            </MenuItem>
          );
        })}
      </MenuList>
    );
  };

  render() {
    const {
      inline, label, canAdd, classes
    } = this.props;
    const { searchText, menu } = this.state;
    if (inline) return this.renderSelect();
    return (
      <Manager>
        <Target>
          <div onClick={this.openMenu}>{label}</div>
        </Target>
        <Popper placement="bottom" eventsEnabled={menu} className={classNames(classes.popper, { [classes.popperClose]: !menu })}>
          <ClickAwayListener onClickAway={this.closeMenu}>
            <Grow in={menu} id="menu-list" style={{ transformOrigin: '0 0 0' }}>
              <Paper elevation={6} className={classes.paper}>
                <div className={classes.searchRoot}>
                  <Input
                    disableUnderline
                    value={searchText}
                    onChange={this.onChangeSearchText}
                    placeholder={canAdd ? I18n.t('forms.searchOrAdd') : I18n.t('forms.search')}
                    classes={{
                      root: classes.search,
                      input: classes.input
                    }}
                    endAdornment={(
                      <InputAdornment position="start">
                        <IconButton>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    )}
                  />
                </div>
                {this.renderSelect()}
              </Paper>
            </Grow>
          </ClickAwayListener>
        </Popper>
      </Manager>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DumbSelect);