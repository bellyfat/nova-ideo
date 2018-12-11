/* eslint-disable react/no-array-index-key, no-confusing-arrow, no-underscore-dangle */
import React from 'react';
import { Field, reduxForm, initialize } from 'redux-form';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { I18n } from 'react-redux-i18n';
import { withStyles } from '@material-ui/core/styles';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import Zoom from '@material-ui/core/Zoom';

import FilesPickerPreview from '../../widgets/FilesPickerPreview';
import SelectChipPreview from '../../widgets/SelectChipPreview';
import {
  renderTextInput, renderRichTextField, renderFilesListField, renderSelect
} from '../../utils';
import UserAvatar from '../../../user/UserAvatar';
import { PROCESSES } from '../../../../processes';
import { getFormattedDate } from '../../../../utils/globalFunctions';
import { getEntityIcon } from '../../../../utils/processes';
import { edit } from '../../../../graphql/processes/ideaProcess';
import Edit from '../../../../graphql/processes/ideaProcess/mutations/Edit.graphql';
import Button, { CancelButton } from '../../../styledComponents/Button';
import Form from '../../Form';
import ImagesPreview from '../../../common/ImagesPreview';

const styles = (theme) => {
  return {
    textContainer: {
      marginTop: 10
    },
    addon: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15
    },
    button: {
      height: 40,
      width: 40,
      color: theme.palette.primary[500]
    },
    avatar: {
      borderRadius: 4,
      marginTop: 1
    },
    form: {
      flex: 1,
      marginTop: 20
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 700,
      margin: '0 0 .25rem',
      fontSize: 13,
      cursor: 'pointer'
    },
    previews: {
      borderTop: 'solid 1px #bfbfbf',
      backgroundColor: '#fafafa',
      padding: 5,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4
    },
    buttonFooter: {
      marginLeft: '5px !important'
    },
    titleRoot: {
      boxShadow: 'none',
      border: 'none',
      backgroundColor: 'transparent'
    },
    titleInput: {
      color: '#2c2d30',
      fontSize: 30,
      fontWeight: 900,
      paddingTop: 3,
      paddingLeft: 0,
      lineHeight: 'normal',
      '&::placeholder': {
        fontSize: 30,
        fontWeight: 900
      },
      '&::-webkit-input-placeholder': {
        fontSize: 30,
        fontWeight: 900
      },
      '&::-moz-placeholder': {
        fontSize: 30,
        fontWeight: 900
      },
      '&::-ms-input-placeholder': {
        fontSize: 30,
        fontWeight: 900
      }
    },
    formTitle: {
      flexGrow: 1
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      margin: '0 10px',
      position: 'relative'
    },
    headerTitle: {
      fontSize: 15,
      color: '#2c2d30',
      fontWeight: 900,
      display: 'flex',
      lineHeight: 'normal'
    },
    titleContainer: {
      display: 'flex'
    },
    headerAddOn: {
      color: '#999999ff',
      fontSize: 12,
      lineHeight: 'normal'
    },
    filesPreviewContainer: {
      padding: 0
    },
    filesPreviewImage: {
      height: 35
    },
    filesPreviewFileIcon: {
      fontSize: '31px !important'
    },
    maskIcon: {
      width: 'auto !important',
      height: 'auto !important'
    },
    maskDefault: {
      height: 40,
      width: 40,
      color: theme.palette.primary[500]
    },
    maskChecked: {
      color: theme.palette.warning[700]
    },
    titleInputContainer: {
      fontSize: 30,
      color: '#2c2d30',
      fontWeight: 900,
      paddingTop: 3,
      lineHeight: 'normal',
      display: 'flex',
      alignItems: 'baseline'
    },
    titleFieldContainer: {
      marginBottom: 2
    },
    closeBtn: {
      '&::after': {
        display: 'block',
        position: 'absolute',
        top: '50%',
        right: 'auto',
        bottom: 'auto',
        left: -4,
        height: 20,
        transform: 'translateY(-50%)',
        borderRadius: 0,
        borderRight: '1px solid #e5e5e5',
        content: '""',
        color: '#2c2d30'
      }
    },
    maxContainer: {
      padding: '9px 16px'
    },
    icon: {
      fontSize: '30px !important'
    },
    iconDisabled: {
      color: '#989898'
    },
    divider: {
      width: 60,
      borderTop: '1px solid #e8e8e8'
    },
    imagesContainer: {
      minWidth: 300,
      float: 'right',
      padding: '0 0 0 8px !important',
      position: 'relative',
      zIndex: 3
    }
  };
};

export class DumbEditIdeaForm extends React.Component {
  filesPicker = null;

  keywordsPicker = null;

  form = null;

  editor = null;

  handleSubmit = () => {
    const {
      formData, valid, idea, action
    } = this.props;
    const processNodes = PROCESSES.ideamanagement.nodes;
    if (valid) {
      const files = formData.values.files || [];
      const newFiles = files.filter((file) => {
        return file && !file.oid;
      });

      const oldFiles = files
        .filter((file) => {
          return file && file.oid;
        })
        .map((file) => {
          return file.oid;
        });
      const { keywords } = formData.values;
      const htmlText = this.editor.getHTMLText();
      const plainText = this.editor.getPlainText();
      if (action.nodeId === processNodes.edit.nodeId) {
        this.props.editIdea({
          context: idea,
          text: htmlText,
          plainText: plainText,
          title: formData.values.title,
          keywords: keywords ? Object.values(formData.values.keywords) : [],
          attachedFiles: newFiles,
          oldFiles: oldFiles
        });
        this.initializeForm();
      }
    }
  };

  initializeForm = () => {
    const { form } = this.props;
    this.closeForm();
    this.props.dispatch(
      initialize(form, {
        title: '',
        keywords: {},
        text: '',
        attachedFiles: []
      })
    );
  };

  closeForm = () => {
    this.form.close();
  };

  render() {
    const {
      idea, formData, site, action, onClose, onOpen, classes, theme
    } = this.props;
    const { author } = idea;
    const isAnonymous = author && author.isAnonymous;
    const authorPicture = author && author.picture;
    const authorTitle = author && author.title;
    const keywords = {};
    site.keywords.forEach((keyword) => {
      keywords[keyword] = keyword;
    });
    let files = [];
    let hasText = false;
    let selectedKeywords = {};
    let hasTitle = false;
    let canSubmit = false;
    let images = [];
    if (formData && formData.values) {
      hasText = this.editor && !this.editor.isEmpty();
      files = formData.values.files ? formData.values.files : [];
      files = files.filter((file) => {
        return file;
      });
      images = files
        .filter((file) => {
          return file.preview && file.preview.type === 'image';
        })
        .map((image) => {
          return { url: image.preview.url, name: image.preview.name };
        });
      const { keywordsRequired } = site;
      const keywordsSatisfied = !keywordsRequired || (keywordsRequired && Object.keys(selectedKeywords).length > 0);
      selectedKeywords = formData.values.keywords ? formData.values.keywords : {};
      hasTitle = formData.values.title;
      canSubmit = hasTitle && keywordsSatisfied && hasText;
    }
    const date = getFormattedDate(idea.createdAt, 'date.format3');
    const IdeaIcon = getEntityIcon(idea.__typename);

    return (
      <Form
        initRef={(form) => {
          this.form = form;
        }}
        transition={Zoom}
        withDrawer
        fullScreen
        open
        onClose={onClose}
        onOpen={onOpen}
        classes={{
          closeBtn: classes.closeBtn,
          maxContainer: classes.maxContainer
        }}
        appBar={(
          <React.Fragment>
            <div className={classes.titleContainer}>
              <UserAvatar
                isAnonymous={isAnonymous}
                picture={authorPicture}
                title={authorTitle}
                classes={{ avatar: classes.avatar }}
              />
              <div className={classes.header}>
                <span className={classes.headerTitle}>{authorTitle}</span>
                <span className={classes.headerAddOn}>{date}</span>
              </div>
            </div>
            <div className={classes.formTitle}>{I18n.t(action.description)}</div>
            <div className={classes.addon}>
              <Field
                props={{
                  label: (
                    <Tooltip title={I18n.t('forms.idea.keywords')} placement="top">
                      <IconButton className={classes.button}>
                        <Icon className="mdi-set mdi-tag-multiple" />
                      </IconButton>
                    </Tooltip>
                  ),
                  options: keywords,
                  canAdd: site.canAddKeywords,
                  initRef: (keywordsPicker) => {
                    this.keywordsPicker = keywordsPicker;
                  }
                }}
                withRef
                name="keywords"
                component={renderSelect}
              />
              <Field
                props={{
                  node: (
                    <Tooltip title={I18n.t('forms.attachFiles')} placement="top">
                      <IconButton className={classes.button}>
                        <AttachFileIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                  initRef: (filesPicker) => {
                    this.filesPicker = filesPicker;
                  }
                }}
                withRef
                name="files"
                component={renderFilesListField}
              />
            </div>
          </React.Fragment>
        )}
        footer={(
          <React.Fragment>
            <FilesPickerPreview
              classes={{
                container: classes.filesPreviewContainer,
                image: classes.filesPreviewImage,
                fileIcon: classes.filesPreviewFileIcon
              }}
              files={files}
              getPicker={() => {
                return this.filesPicker;
              }}
            />
            <CancelButton onClick={this.closeForm}>{I18n.t('forms.cancel')}</CancelButton>
            <Button
              disabled={!canSubmit}
              onClick={this.handleSubmit}
              background={theme.palette.success[500]}
              className={classes.buttonFooter}
            >
              {I18n.t(action.submission)}
            </Button>
          </React.Fragment>
        )}
      >
        <div className={classes.form}>
          <div className={classes.titleInputContainer}>
            <IdeaIcon className={classNames(classes.icon, { [classes.iconDisabled]: !hasTitle })} />
            <Field
              props={{
                placeholder: I18n.t('forms.idea.titleHelper'),
                classes: {
                  container: classes.titleFieldContainer,
                  root: classes.titleRoot,
                  input: classes.titleInput
                }
              }}
              name="title"
              component={renderTextInput}
              onChange={() => {}}
            />
          </div>
          <SelectChipPreview
            items={Object.keys(selectedKeywords).map((id) => {
              return { id: id, label: selectedKeywords[id] };
            })}
            onItemDelete={(id) => {
              this.keywordsPicker.toggleOption(false, id);
            }}
          />
          <div className={classes.divider} />
          <div className={classes.textContainer}>
            {images.length > 0 && (
              <div className={classes.imagesContainer}>
                <ImagesPreview
                  images={images}
                  context={{
                    title: idea.title,
                    author: idea.author,
                    date: idea.createdAt
                  }}
                />
              </div>
            )}
            <Field
              props={{
                initRef: (editor) => {
                  this.editor = editor;
                }
              }}
              name="text"
              component={renderRichTextField}
              type="text"
              withRef
              onChange={() => {}}
            />
          </div>
        </div>
      </Form>
    );
  }
}

// Decorate the form component
const EditIdeaReduxForm = reduxForm()(DumbEditIdeaForm);

const mapStateToProps = (state, props) => {
  return {
    formData: state.form[props.form],
    site: state.globalProps.site
  };
};

const EditIdeaForm = graphql(Edit, {
  props: function (props) {
    return {
      editIdea: edit(props)
    };
  }
})(EditIdeaReduxForm);

export default withStyles(styles, { withTheme: true })(connect(mapStateToProps)(EditIdeaForm));