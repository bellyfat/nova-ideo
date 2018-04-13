import React from 'react';
import { I18n } from 'react-redux-i18n';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import debounce from 'lodash.debounce';

import Comments from '../../graphql/queries/Comments.graphql';
import FlatList from '../common/FlatList';
import { filterActions } from '../../utils/processes';
import CommentItem from './CommentItem';
import Illustration from '../common/Illustration';
import CommentsFooter from './CommentsFooter';
import ChatAppRight from './chatAppRight/ChatAppRight';
import Divider from './Divider';
import Comment from '../forms/processes/common/Comment';
import { COMMENTS_ACTIONS, ACTIONS } from '../../processes';
import { NO_COMMENT, CT_COMMENT } from '../../constants';
import { markAsRead } from '../../graphql/processes/commentProcess';
import MarkAsRead from '../../graphql/processes/commentProcess/mutations/MarkAsRead.graphql';

const styles = (theme) => {
  return {
    container: {
      height: 'calc(100vh - 66px)',
      position: 'relative'
    },
    comments: {
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    },
    commentsWithRight: {
      paddingRight: '0 !important',
      [theme.breakpoints.only('xs')]: {
        display: 'none'
      }
    },
    commentsWithRightFull: {
      display: 'none'
    },
    right: {
      backgroundColor: '#f9f9f9',
      borderLeft: '1px solid #e8e8e8',
      padding: '0 !important'
    },
    list: {
      height: 'calc(100% - 55px)'
    },
    header: {
      margin: '48px 32px 16px 16px',
      color: '#2c2d30',
      fontSize: 17,
      lineHeight: 1.5
    },
    blockComments: {
      position: 'absolute',
      bottom: 7,
      width: 'calc(100% - 49px)'
    }
  };
};

const NoComments = () => {
  return <Illustration img={NO_COMMENT} message={I18n.t('channels.noMessage')} />;
};

const CtComment = () => {
  return <Illustration img={CT_COMMENT} message={I18n.t('channels.ctComment')} />;
};

export class RenderComments extends React.Component {
  static defaultProps = {
    displayForm: true,
    dynamicDivider: true,
    displayFooter: true
  };

  componentDidUpdate() {
    const { data, markAsReadComments } = this.props;
    const channel = data.node;
    if (channel && channel.unreadComments && channel.unreadComments.length > 0) {
      debounce(() => {
        markAsReadComments({ context: channel, isDiscussion: channel.isDiscuss });
      }, 400)();
    }
  }

  render() {
    const {
      channelId,
      data,
      customScrollbar,
      dynamicDivider,
      reverted,
      inline,
      ignorDrawer,
      fullScreen,
      rightDisabled,
      rightOpen,
      rightFull,
      fetchMoreOnEvent,
      displayForm,
      formTop,
      formProps,
      classes,
      moreBtn,
      displayFooter,
      Footer,
      NoItems
    } = this.props;
    const channel = data.node;
    const subject = channel && channel.subject;
    const commentAction =
      displayForm && subject && subject.actions && filterActions(subject.actions, { behaviorId: COMMENTS_ACTIONS })[0];
    const contextOid = subject ? subject.oid : '';
    const displayRightBlock = !rightDisabled && rightOpen;
    const commentForm =
      commentAction &&
      <Comment
        key={channelId}
        form={channelId}
        channel={channel}
        context={contextOid}
        subject={contextOid}
        action={commentAction}
        {...formProps}
        classes={{ container: classNames(classes.formContainer, { [classes.blockComments]: !inline }) }}
      />;
    return (
      <Grid className={classes.container} container>
        <Grid
          className={classNames(classes.comments, {
            [classes.commentsWithRight]: displayRightBlock,
            [classes.commentsWithRightFull]: displayRightBlock && rightFull
          })}
          item
          xs={12}
          md={displayRightBlock ? 8 : 12}
          sm={displayRightBlock ? 7 : 12}
        >
          {formTop && commentForm}
          <FlatList
            Footer={displayFooter && (Footer || CommentsFooter)}
            NoItems={NoItems || (commentAction ? NoComments : CtComment)}
            customScrollbar={customScrollbar}
            fetchMoreOnEvent={fetchMoreOnEvent}
            scrollEvent={channelId}
            reverted={reverted}
            onEndReachedThreshold={reverted ? 0.3 : 0.7}
            data={data}
            getEntities={(entities) => {
              return entities.node && entities.node.comments;
            }}
            ListItem={CommentItem}
            Divider={Divider}
            dividerProps={{
              fullScreen: fullScreen,
              ignorDrawer: ignorDrawer,
              dynamic: dynamicDivider
            }}
            itemProps={{
              channel: channel,
              inline: inline,
              unreadCommentsIds:
                channel && channel.unreadComments
                  ? channel.unreadComments.map((comment) => {
                    return comment.id;
                  })
                  : []
            }}
            moreBtn={moreBtn}
            className={classes.list}
          />
          {!formTop && commentForm}
        </Grid>
        {displayRightBlock && channel
          ? <Grid className={classes.right} item xs={12} md={rightFull ? 12 : 4} sm={rightFull ? 12 : 5}>
            <ChatAppRight channel={channel} />
          </Grid>
          : null}
      </Grid>
    );
  }
}

export const mapStateToProps = (state) => {
  return {
    rightOpen: state.apps.chatApp.right.open,
    rightFull: state.apps.chatApp.right.full
  };
};

export default withStyles(styles, { withTheme: true })(
  connect(mapStateToProps)(
    graphql(Comments, {
      options: (props) => {
        return {
          fetchPolicy: 'cache-and-network',
          notifyOnNetworkStatusChange: true,
          variables: {
            filter: props.filter ? props.filter.text : '',
            pinned: props.filter ? !!props.filter.pinned : false,
            file: props.filter ? !!props.filter.file : false,
            first: 25,
            after: '',
            id: props.channelId,
            processIds: [],
            nodeIds: [],
            processTags: [],
            actionTags: [ACTIONS.primary],
            subjectActionsNodeIds: COMMENTS_ACTIONS
          }
        };
      }
    })(
      graphql(MarkAsRead, {
        props: function (props) {
          return {
            markAsReadComments: markAsRead(props)
          };
        }
      })(RenderComments)
    )
  )
);