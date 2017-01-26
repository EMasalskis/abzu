import React, { Component, PropTypes } from 'react'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'
import TextField from 'material-ui/TextField'
import MapsMyLocation from 'material-ui/svg-icons/maps/my-location'
import IconButton from 'material-ui/IconButton'
import { MapActions } from '../actions/'
import { connect } from 'react-redux'

class PathJunctionItem extends React.Component {

  static propTypes = {
    translations: PropTypes.object.isRequired,
    pathJunction: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    handleRemovePathJunction: PropTypes.func.isRequired,
    handleLocateOnMap: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
  }

  handleNameChange = (event) => {
    const { dispatch, index } = this.props
    dispatch(MapActions.changePathJuctionName(index, event.target.value))
  }

  handleDescriptionChange = (event) => {
    const { dispatch, index } = this.props
    dispatch(MapActions.changePathJunctionDescription(index, event.target.value))
  }

  render() {

    const { pathJunction, translations, expanded, handleToggleCollapse, index } = this.props

    const description = pathJunction.description || ''

    const removeStyle = {
      float: 'right',
      paddingBottom: 0
    }

    const locationStyle = {
      marginRight: 5,
      verticalAlign: 'text-top',
      height: 16,
      width: 16
    }

    return (
      <div>
        <div className='tabItem'>
          <div style={{float: "left", width: "95%", marginTop: 20, padding: 5}}>
            <MapsMyLocation style={locationStyle} onClick={() => this.props.handleLocateOnMap(pathJunction.centroid)}/>
            <div style={{display: 'inline-block'}} onClick={() => handleToggleCollapse(index, 'pathJunction')}>
              {pathJunction.name.length ? pathJunction.name : 'N/A'}
            </div>
            <div style={{display: 'inline-block'}} onClick={() => handleToggleCollapse(index, 'pathJunction')}>
            </div>
            { !expanded
              ? <NavigationExpandMore
                  onClick={() => handleToggleCollapse(index, 'pathJunction')}
                  style={{float: "right"}}
            />
              : <NavigationExpandLess
                  onClick={() => handleToggleCollapse(index, 'pathJunction')}
                  style={{float: "right"}}
            />
            }
          </div>
        </div>
        { !expanded ? null
          : <div>
          <TextField
            hintText={translations.name}
            floatingLabelText={translations.name}
            value={pathJunction.name}
            style={{width: "95%", marginTop: -10}}
            onChange={e => typeof e.target.value === 'string' && this.handleNameChange(e)}
          />
          <TextField
            hintText={translations.description}
            floatingLabelText={translations.description}
            value={description}
            style={{width: "95%", marginTop: -10}}
            onChange={e => typeof e.target.value === 'string' && this.handleDescriptionChange(e)}
          />
          <IconButton
            iconClassName="material-icons"
            style={removeStyle}
            onClick={this.props.handleRemovePathJunction}
          >
            delete
          </IconButton>
        </div>
        }
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch
  }
}

export default connect(
  null,
  mapDispatchToProps
)(PathJunctionItem)
