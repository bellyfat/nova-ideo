import update from 'immutability-helper';
import gql from 'graphql-tag';

import Idea from '../../fragments/Idea.graphql';
import { ACTIONS } from '../../../processes';

export const archiveMutation = gql`
  mutation(
    $context: String!
    $explanation: String
    $processIds: [String]
    $nodeIds: [String]
    $processTags: [String]
    $actionTags: [String]
  ) {
    archiveIdea(context: $context, explanation: $explanation) {
      status
      idea {
        ...Idea
      }
    }
  }
  ${Idea}
`;

export default function archive({ mutate }) {
  return ({ context, explanation }) => {
    return mutate({
      variables: {
        context: context.oid,
        explanation: explanation,
        actionTags: [ACTIONS.primary],
        processIds: [],
        nodeIds: [],
        processTags: []
      },
      optimisticResponse: {
        __typename: 'Mutation',
        archiveIdea: {
          __typename: 'ArchiveIdea',
          status: true,
          idea: {
            ...context,
            state: ['archived'],
            actions: []
          }
        }
      },
      updateQueries: {
        IdeasList: (prev, { mutationResult }) => {
          const newIdea = mutationResult.data.archiveIdea.idea;
          const currentIdea = prev.ideas.edges.filter((item) => {
            return item && item.node.id === newIdea.id;
          })[0];
          if (!currentIdea) return false;
          const index = prev.ideas.edges.indexOf(currentIdea);
          return update(prev, {
            ideas: {
              edges: {
                $splice: [[index, 1, { __typename: 'Idea', node: newIdea }]]
              }
            }
          });
        },
        Idea: (prev, { mutationResult, queryVariables }) => {
          const newIdea = mutationResult.data.archiveIdea.idea;
          if (queryVariables.id !== context.id) return false;
          return update(prev, {
            idea: {
              actions: { $set: newIdea.actions },
              state: { $set: newIdea.state }
            }
          });
        },
        Comments: (prev, { mutationResult, queryVariables }) => {
          const newIdea = mutationResult.data.archiveIdea.idea;
          const channelId = newIdea.channel.id;
          if (queryVariables.id !== channelId) return false;
          return update(prev, {
            node: {
              subject: {
                actions: { $set: newIdea.actions }
              }
            }
          });
        }
      }
    });
  };
}