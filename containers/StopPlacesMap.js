import { connect } from 'react-redux'
import React, { Component, PropTypes } from 'react'
import LeafletMap from '../components/LeafletMap'
import { StopPlaceActions, UserActions } from '../actions/'
import { withApollo } from 'react-apollo'
import { stopPlaceBBQuery } from '../actions/Queries'
import { getIn } from '../utils/'

class StopPlacesMap extends React.Component {

  handleClick(e, map) {

    const { isCreatingNewStop } = this.props

    if (isCreatingNewStop) {
      map.leafletElement.doubleClickZoom.disable()
      this.props.dispatch( StopPlaceActions.createNewStop(e.latlng) )
    } else {
      map.leafletElement.doubleClickZoom.enable()
    }

  }

  handleBaselayerChanged(value) {
    this.props.dispatch(UserActions.changeActiveBaselayer(value))
  }

  handleDragEnd(marker, index) {

  }

  handleMapMoveEnd(event, { leafletElement }) {

    const zoom = leafletElement.getZoom()

    if (zoom > 14) {

      const bounds = leafletElement.getBounds()

      const { ignoreStopId } = this.props

      this.props.client.query({
        query: stopPlaceBBQuery,
        variables: {
          latMin: bounds.getSouthWest().lat,
          latMax: bounds.getNorthEast().lat,
          lonMin: bounds.getSouthWest().lng,
          lonMax: bounds.getNorthEast().lng,
          ignoreStopPlaceId: ignoreStopId
        }
      })

    } else {
      this.props.dispatch(UserActions.removeStopsNearbyForOverview())
    }

  }

  render() {

    const { position, markers, zoom } = this.props

    return (
      <LeafletMap
        position={position}
        markers={markers}
        zoom={zoom}
        onDoubleClick={this.handleClick.bind(this)}
        handleDragEnd={this.handleDragEnd}
        handleMapMoveEnd={this.handleMapMoveEnd.bind(this)}
        dragableMarkers={false}
        activeBaselayer={this.props.activeBaselayer}
        handleBaselayerChanged={this.handleBaselayerChanged.bind(this)}
        enablePolylines={false}
        />
    )
  }
}

const mapStateToProps = state => {

  const {
    newStop,
    centerPosition,
    activeSearchResult,
    zoom,
    neighbourStops
  } = state.stopPlace

  const { isCreatingNewStop } = state.user

  let markers = activeSearchResult ? [ activeSearchResult ] : []

  if (newStop && isCreatingNewStop) {
    markers = markers.concat(newStop)
  }

  if (neighbourStops && neighbourStops.length) {
    markers = markers.concat(neighbourStops)
  }

  return {
    position: centerPosition,
    markers: markers,
    zoom: zoom,
    isCreatingNewStop: state.user.isCreatingNewStop,
    activeBaselayer: state.user.activeBaselayer,
    ignoreStopId: getIn(state.stopPlace, ['activeSearchResult', 'id'], undefined)
  }
}

export default withApollo(connect(mapStateToProps)(StopPlacesMap))
