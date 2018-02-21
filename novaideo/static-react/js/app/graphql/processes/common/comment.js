import update from 'immutability-helper';
import { gql } from 'react-apollo';

import { commentFragment } from '../../queries';
import { filterActions } from '../../../utils/processes';
import { PROCESSES, ACTIONS } from '../../../processes';

export const commentMutation = gql`
  mutation($context: String!, $comment: String!, $action: String!, $attachedFiles: [Upload], $anonymous: Boolean,
           $processIds: [String], $nodeIds: [String], $processTags: [String], $actionTags: [String]) {
    commentObject(
      context: $context
      comment: $comment
      action: $action
      attachedFiles: $attachedFiles,
      anonymous: $anonymous
    ) {
      status
      isNewChannel
      comment {
        ...comment
      }
    }
  }
  ${commentFragment}
`;

export default function comment({ ownProps, mutate }) {
  return ({ context, text, action, attachedFiles, anonymous, account }) => {
    const { formData } = ownProps;
    const files =
      attachedFiles.length > 0
        ? formData.values.files.map((file) => {
          return {
            url: file.preview.url,
            isImage: file.preview.type === 'image',
            variations: [],
            __typename: 'File'
          };
        })
        : [];
    const createdAt = new Date();
    let authorId = account.id;
    let authorOid = account.oid;
    let authorTitle = account.title;
    if (anonymous) {
      if (account.mask) {
        authorId = account.mask.id;
        authorOid = account.mask.oid;
        authorTitle = account.mask.title;
      } else {
        authorId = 'anonymousId';
        authorOid = 'anonymousOid';
        authorTitle = 'Anonymous';
      }
    }
    const commentChannel = ownProps.channel;
    const channel = commentChannel || {
      id: `${authorId}-channel`,
      isDiscuss: ownProps.isDiscuss,
      oid: `${authorOid}-channel`,
      title: authorTitle,
      __typename: 'Channel'
    };
    return mutate({
      variables: {
        context: context,
        comment: text,
        attachedFiles: attachedFiles,
        anonymous: anonymous,
        action: action,
        processIds: [],
        nodeIds: [],
        processTags: [],
        actionTags: [ACTIONS.primary]
      },
      optimisticResponse: {
        __typename: 'Mutation',
        commentObject: {
          __typename: 'CommentObject',
          status: true,
          isNewChannel: false,
          comment: {
            __typename: 'Comment',
            id: '0',
            oid: '0',
            channel: {
              ...channel,
              unreadComments: []
            },
            rootOid: ownProps.subject,
            createdAt: createdAt.toISOString(),
            text: text,
            attachedFiles: files,
            urls: [],
            edited: false,
            pinned: false,
            author: {
              __typename: 'Person',
              id: `${authorId}comment`,
              oid: `${authorOid}comment`,
              isAnonymous: anonymous,
              description: account.description,
              function: account.function,
              title: authorTitle,
              picture:
                !anonymous && account.picture
                  ? {
                    __typename: 'File',
                    url: account.picture.url
                  }
                  : null
            },
            actions: [],
            lenComments: 0
          }
        }
      },
      updateQueries: {
        IdeasList: (prev) => {
          const currentIdea = prev.ideas.edges.filter((item) => {
            return item && item.node.oid === ownProps.subject;
          })[0];
          if (!currentIdea) return false;
          const commentAction = filterActions(currentIdea.node.actions, {
            behaviorId: PROCESSES.ideamanagement.nodes.comment.nodeId
          })[0];

          const indexAction = currentIdea.node.actions.indexOf(commentAction);
          const newAction = update(commentAction, {
            counter: { $set: commentAction.counter + 1 }
          });
          const newIdea = update(currentIdea, {
            node: {
              actions: {
                $splice: [[indexAction, 1, newAction]]
              }
            }
          });
          const index = prev.ideas.edges.indexOf(currentIdea);
          return update(prev, {
            ideas: {
              edges: {
                $splice: [[index, 1, newIdea]]
              }
            }
          });
        },
        Idea: (prev, { queryVariables }) => {
          if (channel.subject && queryVariables.id !== channel.subject.id) return false;
          const commentAction = filterActions(prev.idea.actions, {
            behaviorId: PROCESSES.ideamanagement.nodes.comment.nodeId
          })[0];
          const indexAction = prev.idea.actions.indexOf(commentAction);
          const newAction = update(commentAction, {
            counter: { $set: commentAction.counter + 1 }
          });
          return update(prev, {
            idea: {
              actions: {
                $splice: [[indexAction, 1, newAction]]
              }
            }
          });
        },
        Person: (prev, { mutationResult }) => {
          if (prev.person.oid !== ownProps.subject) return false;
          const newChannel = mutationResult.data.commentObject.comment.channel;
          const commentAction = filterActions(prev.person.actions, {
            behaviorId: PROCESSES.usermanagement.nodes.discuss.nodeId
          })[0];
          const indexAction = prev.person.actions.indexOf(commentAction);
          const newAction = update(commentAction, {
            counter: { $set: commentAction.counter + 1 }
          });
          const setChannel = !commentChannel && {
            channel: { $set: { __typename: 'channel', id: newChannel.id, oid: newChannel.oid, title: newChannel.title } }
          };
          return update(prev, {
            person: {
              ...setChannel,
              actions: {
                $splice: [[indexAction, 1, newAction]]
              }
            }
          });
        },
        PersonInfo: (prev, { mutationResult }) => {
          if (prev.person.oid !== ownProps.subject) return false;
          const newChannel = mutationResult.data.commentObject.comment.channel;
          const commentAction = filterActions(prev.person.actions, {
            behaviorId: PROCESSES.usermanagement.nodes.discuss.nodeId
          })[0];
          const indexAction = prev.person.actions.indexOf(commentAction);
          const newAction = update(commentAction, {
            counter: { $set: commentAction.counter + 1 }
          });
          const setChannel = !commentChannel && {
            channel: { $set: { __typename: 'channel', id: newChannel.id, oid: newChannel.oid, title: newChannel.title } }
          };
          return update(prev, {
            person: {
              ...setChannel,
              actions: {
                $splice: [[indexAction, 1, newAction]]
              }
            }
          });
        },
        Channels: (prev, { mutationResult }) => {
          const newChannel = mutationResult.data.commentObject.comment.channel;
          const isNewChannel = mutationResult.data.commentObject.isNewChannel;
          if (newChannel.isDiscuss || !isNewChannel) return false;
          const currentChannel = prev.account.channels.edges.filter((item) => {
            return item && item.node.id === newChannel.id;
          })[0];
          if (currentChannel) return false;
          return update(prev, {
            account: {
              channels: {
                edges: {
                  $unshift: [
                    {
                      __typename: 'Channel',
                      node: newChannel
                    }
                  ]
                }
              }
            }
          });
        },
        Discussions: (prev, { mutationResult }) => {
          const newChannel = mutationResult.data.commentObject.comment.channel;
          const isNewChannel = mutationResult.data.commentObject.isNewChannel;
          if (!newChannel.isDiscuss || !isNewChannel) return false;
          const currentChannel = prev.account.discussions.edges.filter((item) => {
            return item && item.node.id === newChannel.id;
          })[0];
          if (currentChannel) return false;
          return update(prev, {
            account: {
              discussions: {
                edges: {
                  $unshift: [
                    {
                      __typename: 'Channel',
                      node: newChannel
                    }
                  ]
                }
              }
            }
          });
        },
        Comments: (prev, { mutationResult }) => {
          if (ownProps.context !== prev.node.subject.oid) return false;
          const newComment = mutationResult.data.commentObject.comment;
          return update(prev, {
            node: {
              lenComments: { $set: prev.node.lenComments + 1 },
              comments: {
                edges: {
                  $unshift: [
                    {
                      __typename: 'Comment',
                      node: newComment
                    }
                  ]
                }
              }
            }
          });
        },
        Comment: (prev, { mutationResult }) => {
          if (ownProps.context !== prev.node.oid) return false;
          const newComment = mutationResult.data.commentObject.comment;
          return update(prev, {
            node: {
              lenComments: { $set: prev.node.lenComments + 1 },
              comments: {
                edges: {
                  $unshift: [
                    {
                      __typename: 'Comment',
                      node: newComment
                    }
                  ]
                }
              }
            }
          });
        }
      }
    });
  };
}