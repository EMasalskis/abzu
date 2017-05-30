import React, { Component, PropTypes } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L, { divIcon } from 'leaflet'
import ParkingIcon from '../static/icons/parking-icon.png'
import { connect } from 'react-redux'
import { enturPrimary } from '../config/enturTheme'

class ParkingAndRideMarker extends React.Component {

  static propTypes = {
    position: PropTypes.arrayOf(PropTypes.number),
    index: PropTypes.number.isRequired,
    handleDragEnd: PropTypes.func.isRequired,
    translations: PropTypes.shape({
      title: PropTypes.string.isRequired,
      totalCapacity: PropTypes.string.isRequired
    }).isRequired
  }

  componentDidUpdate() {
    const { focusedElement, index, type } = this.props
    const isFocused = (focusedElement.type === type && index === focusedElement.index)
    if (isFocused) {
      L.DomUtil.addClass(this.refs.marker.leafletElement._icon, 'focused')
    } else {
      L.DomUtil.removeClass(this.refs.marker.leafletElement._icon, 'focused')
    }
  }

  shouldComponentUpdate(nextProps) {
    if (JSON.stringify(this.props.position) !== JSON.stringify(nextProps.position)) {
      return true
    }

    if (JSON.stringify(this.props.focusedElement) !== JSON.stringify(nextProps.focusedElement)) {
      return true
    }

    if (this.props.name !== nextProps.name) {
      return true
    }

    if (this.props.totalCapacity !== nextProps.totalCapacity) {
      return true
    }

    return false
  }

  render() {

    const { position, index, handleDragEnd, translations, name, totalCapacity, draggable } = this.props

    if (!position) return null

    const icon = L.icon({
      iconUrl: ParkingIcon,
      iconSize: [20, 30],
      iconAnchor: [10, 30],
      popupAnchor: [0, 15],
    })

    return (
      <Marker
        draggable={draggable}
        position={position}
        icon={icon}
        key={"parking-marker" +index}
        onDragend={(event) => { handleDragEnd(index, 'parking', event) }}
        ref="marker"
      >
        <Popup>
          <div>
            <div style={{fontWeight: 600, textAlign: 'center', margin: '5 0', fontSize: '1.1em', color: enturPrimary}}>{ name }</div>
            <div style={{marginTop: -2, textAlign: 'center', marginBottom: 5, fontWeight: 600, fontSize: '1em'}}>{ translations.title } </div>
            <div style={{marginTop: -2, marginBottom: 5, fontSize: '1em', color: '#191919'}}>
              {translations.totalCapacity}: { totalCapacity || 0 }
            </div>
          </div>
        </Popup>
      </Marker>
    )
  }
}

const mapStateToProps = state => ({
  focusedElement: state.mapUtils.focusedElement
})

export default connect(mapStateToProps)(ParkingAndRideMarker)

