/* eslint-disable no-undef */
import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import { Scrollbars } from 'react-custom-scrollbars';

import { setURLState } from '../../actions/actions';
import { ListItem as ListEntitiesItem } from './ListItem';

const styles = {
  thumbVertical: {
    zIndex: 1,
    cursor: 'pointer',
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  },
  progress: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  }
};

function emptyContainer({ children }) {
  return children;
}

function scrollbarsContainer({ children, handleScroll, scrollbarStyle }) {
  return (
    <Scrollbars
      renderView={(props) => {
        return <div {...props} style={{ ...props.style, ...scrollbarStyle }} />;
      }}
      renderThumbVertical={(props) => {
        return <div {...props} style={{ ...props.style, ...styles.thumbVertical }} />;
      }}
      onScrollFrame={handleScroll}
    >
      {children}
    </Scrollbars>
  );
}

function itemContainer({ itemHeightEstimation, children }) {
  return (
    <ListEntitiesItem itemHeightEstimation={itemHeightEstimation}>
      {children}
    </ListEntitiesItem>
  );
}

export class DumbEntitiesList extends React.Component {
  static defaultProps = {
    virtualized: false,
    onEndReachedThreshold: 0.7,
    progressStyle: { size: 30 }
  };

  constructor(props) {
    super(props);
    this.offline = {
      entities: undefined,
      status: false
    };
    this.loading = false;
  }

  componentDidMount() {
    if (this.props.isGlobal) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  componentWillUpdate(nextProps) {
    const { data, filter, network, getEntities, offlineFilter } = nextProps;
    let entities;
    let offlineStatus = false;
    try {
      if (data.error || !network.isConnected || network.url.error) {
        const dataEntities = getEntities(data);
        offlineStatus = true;
        if (!filter) {
          entities = dataEntities.edges;
        } else {
          const words = filter.toLowerCase().split(' ').filter((item) => {
            return item;
          });
          entities = dataEntities.edges.filter((entity) => {
            return words
              .map((item) => {
                return offlineFilter(entity, item);
              })
              .includes(true);
          });
        }
      }
      this.setOfflineData(entities, offlineStatus);
    } catch (e) {
      this.setOfflineData(entities, offlineStatus, true, network);
    }
  }

  componentWillUnmount() {
    if (this.props.isGlobal) {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll = (values) => {
    if (!this.loading) {
      const { onEndReachedThreshold, reverted } = this.props;
      if (this.props.isGlobal) {
        const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = windowHeight + window.pageYOffset;
        const threshold = docHeight * onEndReachedThreshold;
        if (windowBottom >= threshold) {
          this.onEndReached();
        }
      } else {
        const { scrollTop, scrollHeight, clientHeight } = values;
        const pad = onEndReachedThreshold * clientHeight;
        if (reverted) {
          const t = (scrollTop - pad) / (scrollHeight - clientHeight);
          if (t !== Infinity && t < 0) this.onEndReached();
        } else {
          const t = (scrollTop + pad) / (scrollHeight - clientHeight);
          if (t !== Infinity && t > 1) this.onEndReached();
        }
      }
    }
  };

  onEndReached = () => {
    // The fetchMore method is used to load new data and add it
    // to the original query we used to populate the list
    const { data, network, getEntities } = this.props;
    // If no request is in flight for this query, and no errors happened. Everything is OK.
    if (data.networkStatus === 7) {
      this.loading = true;
      data
        .fetchMore({
          variables: { after: getEntities(data).pageInfo.endCursor || '' },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            // Don't do anything if there weren't any new items
            const previousResultEntities = getEntities(previousResult);
            if (!fetchMoreResult || !previousResultEntities.pageInfo.hasNextPage) {
              return previousResult;
            }
            const fetchMoreResultEntities = getEntities(fetchMoreResult);
            fetchMoreResultEntities.edges = previousResultEntities.edges.concat(fetchMoreResultEntities.edges);
            return fetchMoreResult;
          }
        })
        .then(() => {
          if (network.url.error) this.props.setURLState(false, []);
          this.loading = false;
        })
        .catch((e) => {
          if (!network.url.error) this.props.setURLState(true, [e.message]);
        });
    }
  };

  onRefresh = () => {
    const { data, network } = this.props;
    data
      .refetch()
      .then(() => {
        if (network.url.error) this.props.setURLState(false, []);
      })
      .catch((e) => {
        if (!network.url.error) this.props.setURLState(true, [e.message]);
      });
  };

  setOfflineData = (entities, status, hasError, network) => {
    this.offline = { entities: entities, status: status };
    if (hasError && !network.url.error) {
      this.props.setURLState(true, []);
    }
  };

  renderProgress = () => {
    const { progressStyle, theme, classes } = this.props;
    const progressColor = progressStyle.color || theme.palette.primary[500];
    return (
      <div className={classes.progress}>
        <CircularProgress size={progressStyle.size} style={{ color: progressColor }} />
      </div>
    );
  };

  render() {
    const {
      data,
      getEntities,
      ListItem,
      itemdata,
      itemHeightEstimation,
      isGlobal,
      style,
      scrollbarStyle,
      reverted,
      virtualized
    } = this.props;
    if (data.error) {
      // the fact of checking data.error remove the Unhandled (in react-apollo)
      // ApolloError error when the graphql server is down
      // Do nothing
    }
    const dataEntities = getEntities(data);
    if (dataEntities == null || data.networkStatus === 1 || data.networkStatus === 2) {
      return (
        <div style={style}>
          {this.renderProgress()}
        </div>
      );
    }
    const offline = this.offline;
    const entities = offline.status ? offline.entities : dataEntities.edges;
    const ScrollContainer = isGlobal ? emptyContainer : scrollbarsContainer;
    const ItemContainer = virtualized ? itemContainer : emptyContainer;
    return (
      <div style={style}>
        <ScrollContainer
          handleScroll={this.handleScroll}
          scrollbarStyle={{
            ...scrollbarStyle,
            ...(reverted
              ? {
                display: 'flex',
                flexDirection: 'column-reverse'
              }
              : {})
          }}
        >
          {entities && entities.length > 0
            ? entities.map((item) => {
              return (
                <ItemContainer itemHeightEstimation={itemHeightEstimation}>
                  <ListItem itemdata={itemdata} node={item.node} />
                </ItemContainer>
              );
            })
            : null}
          {data.networkStatus === 3 && dataEntities.pageInfo.hasNextPage && this.renderProgress()}
        </ScrollContainer>
      </div>
    );
  }
}

export const mapStateToProps = (state) => {
  return { network: state.network, filter: state.search.text };
};

export const mapDispatchToProps = { setURLState: setURLState };

export default withStyles(styles, { withTheme: true })(connect(mapStateToProps, mapDispatchToProps)(DumbEntitiesList));