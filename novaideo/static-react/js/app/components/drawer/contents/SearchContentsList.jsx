/* eslint-disable no-undef */
import React from 'react';
import { Query } from 'react-apollo';
import { withStyles } from '@material-ui/core/styles';
import { I18n } from 'react-redux-i18n';

import FlatList from '../../common/FlatList';
import AllContents from '../../../graphql/queries/AllContents.graphql';
import Search from '../../forms/Search';
import SearchContentItem from './SearchContentItem';
import { getFormId } from '../../../utils/globalFunctions';

const styles = {
  container: {
    height: 255,
    '@media  (max-height:450px)': {
      height: 'calc(100vh - 215px)'
    },
    '@media (max-height:370px)': {
      height: 'calc(100vh - 205px)'
    },
    '@media(max-height:280px)': {
      height: 'calc(100vh - 195px)'
    }
  },
  searchContainer: {
    paddingLeft: 0,
    paddingRight: 0,
    borderRadius: 6,
    marginBottom: 15,
    height: 50
  },
  placeholder: {
    top: 16
  }
};

class SearchContentsList extends React.Component {
  state = {
    filter: { text: '' }
  };

  handelSearch = (filter) => {
    this.setState({ filter: filter });
  };

  handleSearchCancel = () => {
    this.setState({ filter: { text: '' } });
  };

  render() {
    const { classes, onItemClick } = this.props;
    const { filter } = this.state;
    const formId = getFormId('jump-contents-search');
    return (
      <React.Fragment>
        <Search
          liveSearch
          form={formId}
          key={formId}
          onSearch={this.handelSearch}
          onCancel={this.handleSearchCancel}
          title={I18n.t('channels.jumpSearch')}
          classes={{
            container: classes.searchContainer,
            placeholder: classes.placeholder
          }}
        />
        <Query
          notifyOnNetworkStatusChange
          fetchPolicy="cache-and-network"
          query={AllContents}
          variables={{ first: 25, after: '', filter: filter }}
        >
          {(data) => {
            return (
              <FlatList
                customScrollbar
                className={classes.container}
                data={data}
                getEntities={(entities) => {
                  return entities.data ? entities.data.allContents : entities.allContents;
                }}
                ListItem={SearchContentItem}
                itemProps={{ onClick: onItemClick }}
                moreBtn={<span>{I18n.t('common.moreResult')}</span>}
              />
            );
          }}
        </Query>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(SearchContentsList);