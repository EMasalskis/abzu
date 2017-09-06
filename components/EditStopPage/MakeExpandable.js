import React from 'react';
import MdExpand from 'material-ui/svg-icons/navigation/expand-more';
import MdCollapse from 'material-ui/svg-icons/navigation/expand-less';
import IconButton from 'material-ui/IconButton';

class MakeExpandable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  handleToggle() {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.ownerId && nextProps.ownerId) {
      if (this.props.ownerId !== nextProps.ownerId) {
        this.setState({
          expanded: false
        });
      }
    }
  }

  render() {
    const { hideToggle, style } = this.props;

    let iconButtonStyle = {
      flexBasis: '100%',
      textAlign: 'right',
      marginBottom: 5,
      marginTop: -10,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: 12,
      visibility: hideToggle ? 'hidden' : ''
    };

    return (
      <div>
        <div style={style}>
          {this.props.children}
          <div style={iconButtonStyle}>
            <IconButton onTouchTap={this.handleToggle.bind(this)}>
              {this.state.expanded ? <MdCollapse /> : <MdExpand />}
            </IconButton>
          </div>
        </div>
        {this.state.expanded && this.props.expandedContent}
      </div>
    );
  }
}

export default MakeExpandable;
