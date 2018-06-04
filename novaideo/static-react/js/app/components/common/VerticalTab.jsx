/* eslint-disable react/no-array-index-key */
import React from 'react';

import Tab from '../Tab';

export class DumbVerticalTab extends React.Component {
  state = {
    expanded: -1
  };

  handleChange = (index) => {
    const { expanded } = this.state;
    this.setState({ expanded: expanded === index ? -1 : index });
  };

  renderEntry = (entry, index) => {
    const { expanded } = this.state;
    return (
      <Tab
        {...entry}
        expanded={expanded === index}
        onChange={() => {
          this.handleChange(index);
        }}
      />
    );
  };

  render() {
    const { tabs, classes } = this.props;
    if (!tabs || tabs.length === 0) return null;
    return (
      <div className={classes.tabContainer}>
        {tabs.map((entry, index) => {
          return this.renderEntry(entry, index);
        })}
      </div>
    );
  }
}

export default DumbVerticalTab;