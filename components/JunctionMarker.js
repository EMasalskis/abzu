import React, { Component, PropTypes } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L, { divIcon } from 'leaflet'
import { connect } from 'react-redux'

class JunctionMarker extends React.Component {

  static propTypes = {
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    index: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    handleDragEnd: PropTypes.func.isRequired,
    handleUpdatePathLink: PropTypes.func.isRequired,
    text: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  }

  componentDidUpdate() {
    const { focusedElement, index, type } = this.props
    const isFocused = (focusedElement.type === type && index === focusedElement.index)
    if (isFocused) {
      L.DomUtil.addClass(this.refs.marker.leafletElement._icon, 'focused')
    }
    L.DomUtil.addClass(this.refs.marker.leafletElement._icon, 'padded-10')
  }

  render() {

    const { position, index, type, handleDragEnd, handleUpdatePathLink } = this.props
    const { text, isCreatingPolylines, polylineStartPoint, name } = this.props

    const iconURL = type === 'entrance'
      ? require("../static/icons/entrance-icon-2x.png")
      : require("../static/icons/junction-icon-2x.png")

    const icon = L.icon({
      iconUrl: iconURL,
      iconSize: [30, 45],
      iconAnchor: [29, 50],
      popupAnchor: [0, 0],
      shadowAnchor: [10, 12],
      shadowSize: [36, 16]
    })

    let pathLinkText = isCreatingPolylines ? text.terminatePathLinkHere : text.createPathLinkHere

    if (isCreatingPolylines && polylineStartPoint.type === type && polylineStartPoint.index == index) {
      pathLinkText = text.cancelPathLink
    }

    return (
      <Marker
        draggable={true}
        position={position}
        icon={icon}
        onDragend={(event) => { handleDragEnd(index, type, event) }}
        ref="marker"
      >
        <Popup>
          <div>
            <div style={{fontWeight: 600, textAlign: 'center', margin: '5 0', fontSize: '1.1em'}}>{name || 'N/A'}</div>
            <div className="quay-marker-title" style={{marginTop: -2, marginBottom: 5, fontSize: '1em', color: '#191919'}}>{text.junctionTitle}</div>
            <div
              className='change-path-link'
              onClick={() => { handleUpdatePathLink(position, index, type) }}
            >{pathLinkText}</div>
          </div>
        </Popup>
      </Marker>
    )
  }
}

const mapStateToProps = state => ({
  isCreatingPolylines: state.stopPlace.isCreatingPolylines,
  polylineStartPoint: state.stopPlace.polylineStartPoint,
  focusedElement: state.mapUtils.focusedElement
})

export default connect(mapStateToProps)(JunctionMarker)
