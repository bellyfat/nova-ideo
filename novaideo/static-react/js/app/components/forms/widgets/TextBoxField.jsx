import React from 'react';

import EmojiPicker from './EmojiPicker';
import TextEditor from './Editor';

class TextBoxField extends React.Component {
  static defaultProps = {
    style: {},
    autoFocus: false,
    withEmoji: true
  };

  constructor(props) {
    super(props);
    this.editor = null;
  }

  componentDidMount() {
    const { autoFocus } = this.props;
    if (autoFocus) {
      this.editor.focus(this.props.value);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { value, autoFocus } = this.props;
    if (this.editor && !nextProps.value && nextProps.value !== value) {
      this.editor.clear(autoFocus);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.value;
  }

  onChange = (value) => {
    if (this.editor) {
      const isEmpty = this.editor.isEmptyText(value);
      const textValue = isEmpty ? '' : value;
      this.props.onChange(textValue);
    }
  };

  onSelectEmoji = (emoji) => {
    // when the animation is complete
    setTimeout(() => {
      this.editor.insertText(emoji);
    }, 200);
  };

  getPlainText = () => {
    this.editor.getPlainText();
  };

  render() {
    const { placeholder, value, style, withEmoji, onCtrlEnter, onEnter } = this.props;
    return [
      <TextEditor
        ref={(editor) => {
          this.editor = editor;
        }}
        placeholder={placeholder}
        value={value}
        onChange={this.onChange}
        onCtrlEnter={onCtrlEnter}
        onEnter={onEnter}
      />,
      withEmoji ? <EmojiPicker style={style || {}} onSelect={this.onSelectEmoji} /> : null
    ];
  }
}

export default TextBoxField;