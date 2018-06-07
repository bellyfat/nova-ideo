/* eslint-disable react/no-array-index-key, no-confusing-arrow */
import React from 'react';
import { connect } from 'react-redux';
import { I18n } from 'react-redux-i18n';
import { withStyles } from '@material-ui/core/styles';
import Zoom from '@material-ui/core/Zoom';
import { withApollo, Query } from 'react-apollo';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent';
import WorkIcon from '@material-ui/icons/Work';

import { getActions } from '../../../../utils/processes';
import { ACTIONS, PROCESSES } from '../../../../processes';
import ProfileParameters from '../../../../graphql/queries/ProfileParameters.graphql';
import VerticalTab from '../../../common/VerticalTab';
import Form from '../../Form';
import EditProfile from './EditProfile';
import EditPassword from './EditPassword';
import AssignRoles from './AssignRoles';
import UserAvatar from '../../../user/UserAvatar';
import EditApiToken from './EditApiToken';

const styles = {
  maxContainer: {
    padding: 5,
    paddingTop: 35,
    maxWidth: 640
  },
  paper: {
    backgroundColor: 'white !important'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 4
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 10px',
    position: 'relative',
    alignItems: 'start'
  },
  headerTitle: {
    fontSize: 15,
    color: '#2c2d30',
    fontWeight: 900,
    display: 'flex',
    lineHeight: 'normal'
  },
  headerAddOn: {
    color: '#999999ff',
    fontSize: 12,
    lineHeight: 'normal',
    fontWeight: 700
  },
  titleContainer: {
    display: 'flex'
  },
  tabPanelRoot: {
    backgroundColor: 'white',
    boxShadow: 'none'
  },
  formTitle: {
    flexGrow: 1
  }
};

export class DumbParamters extends React.Component {
  form = null;

  closeForm = () => {
    this.form.close();
  };

  render() {
    const { account, onClose, classes, theme } = this.props;
    const authorPicture = account && account.picture;
    const authorTitle = account && account.title;
    const func = account && account.function;
    const functionKey = 'function';
    const userProcessNodes = PROCESSES.usermanagement.nodes;
    return (
      <Form
        initRef={(form) => {
          this.form = form;
        }}
        open
        fullScreen
        transition={Zoom}
        onClose={onClose}
        classes={{
          closeBtn: classes.closeBtn,
          maxContainer: classes.maxContainer,
          paper: classes.paper
        }}
        appBar={[
          <div className={classes.titleContainer}>
            <UserAvatar picture={authorPicture} title={authorTitle} classes={{ avatar: classes.avatar }} />
            <div className={classes.header}>
              <span className={classes.headerTitle}>{authorTitle}</span>
              <span className={classes.headerAddOn}>{func}</span>
            </div>
          </div>,
          <div className={classes.formTitle}>Paramètres de votre compte</div>
        ]}
      >
        <Query
          notifyOnNetworkStatusChange
          fetchPolicy="cache-and-network"
          query={ProfileParameters}
          variables={{
            id: account.id,
            processIds: [PROCESSES.usermanagement.id],
            nodeIds: [],
            processTags: [],
            actionTags: [ACTIONS.parametersMenu]
          }}
        >
          {(result) => {
            const profile = result.data && result.data.person;
            if (!profile) return null;
            const roles = {};
            profile.roles.forEach((role) => {
              roles[role] = I18n.t(`roles.${role}`);
            });
            const parametersMenuActions = getActions(profile.actions).map((action) => {
              return action.behaviorId;
            });
            return (
              <VerticalTab
                classes={{
                  panelRoot: classes.tabPanelRoot
                }}
                tabs={[
                  parametersMenuActions.includes(userProcessNodes.edit.nodeId) && {
                    title: 'Profil',
                    description: 'Mise à jour de vos coordonnées, modifications des photos et images',
                    content: (
                      <EditProfile
                        form={`edit-profile${account.id}`}
                        key={`edit-profile${account.id}`}
                        account={profile}
                        initialValues={{
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          email: profile.email,
                          [functionKey]: profile.function,
                          description: profile.description,
                          locale: profile.locale,
                          picture: profile.picture && {
                            id: profile.picture.id,
                            oid: profile.picture.oid,
                            name: profile.picture.title,
                            size: profile.picture.size || 0,
                            mimetype: profile.picture.mimetype,
                            type: profile.picture.mimetype,
                            preview: { url: profile.picture.url, type: 'image' }
                          },
                          coverPicture: profile.coverPicture && {
                            id: profile.coverPicture.id,
                            oid: profile.coverPicture.oid,
                            name: profile.coverPicture.title,
                            size: profile.coverPicture.size || 0,
                            mimetype: profile.coverPicture.mimetype,
                            type: profile.coverPicture.mimetype,
                            preview: { url: profile.coverPicture.url, type: 'image' }
                          }
                        }}
                      />
                    ),
                    Icon: AccountCircleIcon
                  },
                  parametersMenuActions.includes(userProcessNodes.editPassword.nodeId) && {
                    title: 'Mot de passe',
                    description: 'Modification du mot de passe',
                    content: (
                      <EditPassword
                        form={`edit-password${account.id}`}
                        key={`edit-password${account.id}`}
                        account={profile}
                        initialValues={{
                          email: profile.email
                        }}
                      />
                    ),
                    Icon: VpnKeyIcon,
                    color: '#d72b3f'
                  },
                  parametersMenuActions.includes(userProcessNodes.getApiToken.nodeId) && {
                    title: 'Jeton API ',
                    description:
                      'Le jeton API est un mot de passe à usage unique. C\'est un dispositif de sécurité. Vous pouvez obtenir un jeton API dans cet onglet.',
                    content: (
                      <EditApiToken form={`editapitoken${account.id}`} key={`editapitoken${account.id}`} account={profile} />
                    ),
                    Icon: SettingsInputComponentIcon,
                    color: '#ff9000'
                  },
                  parametersMenuActions.includes(userProcessNodes.assignRoles.nodeId) && {
                    title: 'Rôles',
                    description:
                      'En tant qu\'administrateur, vous pouvez assigner un rôle à chacun des membres. Accéder ici à cette fonctionnalité',
                    content: (
                      <AssignRoles
                        form={`Assign-roles${account.id}`}
                        key={`Assign-roles${account.id}`}
                        account={profile}
                        initialValues={{
                          roles: roles
                        }}
                      />
                    ),
                    Icon: WorkIcon,
                    color: theme.palette.success[800]
                  }
                ]}
              />
            );
          }}
        </Query>
      </Form>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    globalProps: state.globalProps
  };
};

export default withStyles(styles, { withTheme: true })(withApollo(connect(mapStateToProps)(DumbParamters)));