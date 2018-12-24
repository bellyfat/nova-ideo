import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { connect } from 'react-redux';
import { I18n } from 'react-redux-i18n';

import {
  toggleDrawer as toggleDrawerOp, search, openFilter, clearFilter
} from '../../actions/collaborationAppActions';
import AccountInformation from '../user/AccountInformation';
import UserMainMenu from '../user/UserMainMenu';
import Search from '../forms/Search';
import { getFormId } from '../../utils/globalFunctions';
import ExaminationProgress from './ExaminationProgress';
import { MAIN_SEARCH_ID, MAIN_FILTER_ID } from '../../constants';
import Alerts from '../user/Alerts';

const styles = {
  flex: {
    flex: 1
  },
  appBar: {
    boxShadow: '0 1px 0 rgba(0,0,0,.1)'
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  userMenuContainer: {
    paddingLeft: 30,
    paddingRight: 30
  },
  accountAvatar: {
    width: 30,
    height: 30,
    borderRadius: 4,
    cursor: 'pointer'
  },
  menuContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: '2px 0 0'
  },
  search: {
    height: 34,
    transition: 'width .15s ease-out 0s',
    minWidth: 360,
    '&:focus-within': {
      minWidth: 437
    },
    '@media (max-width:1440px)': {
      minWidth: 315,
      '&:focus-within': {
        minWidth: 387
      }
    },
    '@media (max-width:1366px)': {
      minWidth: 260,
      '&:focus-within': {
        minWidth: 337
      }
    },
    '@media (max-width:1279px)': {
      minWidth: 245,
      '&:focus-within': {
        minWidth: 312
      }
    },
    '@media (max-width:1070px)': {
      width: 225,
      '&:focus-within': {
        width: 282
      }
    },
    '@media (max-width:860px)': {
      width: 195,
      '&:focus-within': {
        width: 257
      }
    }
  },
  searchContainer: {
    paddingLeft: 5
  }
};

class NavBar extends React.Component {
  handelSearch = (filter) => {
    if (filter.text) {
      this.props.search(MAIN_SEARCH_ID, filter.text);
    }
  };

  handleSearchCancel = () => {
    this.props.search(MAIN_SEARCH_ID, '');
  };

  toggleFilter = () => {
    const { openFilterSection, closeFilterSection, filterOpened } = this.props;
    if (filterOpened) {
      closeFilterSection(MAIN_FILTER_ID);
    } else {
      openFilterSection(MAIN_FILTER_ID, {});
    }
  };

  render() {
    const {
      classes, className, drawer, site, toggleDrawer, filterOpened, account
    } = this.props;
    const formId = getFormId(MAIN_SEARCH_ID);
    return (
      <div>
        <AppBar className={classNames(className, classes.appBar)} color="inherit">
          <Toolbar>
            <IconButton className={classes.menuButton} aria-label="Menu" onClick={toggleDrawer}>
              {drawer ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
            <Typography component="div" type="title" className={classes.flex}>
              {!drawer && site.title}
            </Typography>
            <div className={classes.menuContainer}>
              <div className={classes.search}>
                <Search
                  liveSearch
                  form={formId}
                  key={formId}
                  onSearch={this.handelSearch}
                  onCancel={this.handleSearchCancel}
                  title={I18n.t('common.search')}
                  classes={{ container: classes.searchContainer }}
                  onFilterClick={this.toggleFilter}
                  filterOpened={filterOpened}
                />
              </div>
            </div>
            {account ? <Alerts userId={account.id} /> : null}
            {!drawer && (
              <div className={classes.userMenuContainer}>
                <UserMainMenu
                  activator={(
                    <AccountInformation
                      onlyIcon
                      classes={{
                        avatar: classes.accountAvatar
                      }}
                    />
                  )}
                />
              </div>
            )}
          </Toolbar>
          {site.examineIdeas ? <ExaminationProgress values={site.examinationDates} /> : null}
        </AppBar>
      </div>
    );
  }
}

export const mapDispatchToProps = {
  toggleDrawer: toggleDrawerOp,
  search: search,
  closeFilterSection: clearFilter,
  openFilterSection: openFilter
};

export const mapStateToProps = (state) => {
  return {
    drawer: state.apps.drawer.open,
    site: state.globalProps.site,
    account: state.globalProps.account,
    filterOpened: !!state.filter[MAIN_FILTER_ID]
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(NavBar));