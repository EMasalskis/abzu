import React, { PropTypes } from 'react'
import StopPlaceMarker from './StopPlaceMarker'
import NewStopMarker from './NewStopMarker'
import { MapActions, UserActions } from '../actions/'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import stopTypes from './stopTypes'
import JunctionMarker from './JunctionMarker'
import { setDecimalPrecision } from '../utils'
import QuayMarker from './QuayMarker'
import { browserHistory } from 'react-router'
import { withApollo } from 'react-apollo'
import { stopPlaceAndPathLink } from '../actions/Queries'

class MarkerList extends React.Component {

  static PropTypes = {
    stops: PropTypes.array.isRequired,
    handleDragEnd: PropTypes.func.isRequired
  }

  handleStopOnClick(id) {
    const { dispatch, client, path } = this.props

    const isAlreadyActive = id == path

    if (!isAlreadyActive) {
      client.query({
        forceFetch: true,
        query: stopPlaceAndPathLink,
        variables: {
          id: id,
        }
      }).then( result => {
        dispatch(UserActions.navigateTo('/edit/', id))
      })
    }
  }

  handleNewStopClick() {
    this.props.dispatch(MapActions.useNewStopAsCurrent())
    browserHistory.push('edit/new')
  }

  handleDragEndNewStop(event) {
    this.props.dispatch(MapActions.changeLocationNewStop(event.target.getLatLng()))
  }

  handleFetchQuaysForNeighbourStop(id) {
    // TODO: fetch quays from neighbour stop by id
  }

  handleHideQuaysForNeighbourStop(id) {
    this.props.dispatch(UserActions.hideQuaysForNeighbourStop(id))
  }

  handleUpdatePathLink(coords, id, type) {
    const { isCreatingPolylines, activeMap, pathLink } = this.props

    if (activeMap) activeMap.closePopup()

    if (pathLink && pathLink.length) {

      let lastPathLink = pathLink[pathLink.length-1]

      if (lastPathLink.from && lastPathLink.from.quay && lastPathLink.from.quay.id === id && !lastPathLink.to) {
        this.props.dispatch(UserActions.removeLastPolyline())
        return
      }
    }

    if (isCreatingPolylines) {
      this.props.dispatch(UserActions.addFinalCoordinesToPolylines(coords, id, type))
    } else {
      this.props.dispatch(UserActions.startCreatingPolyline(coords, id, type))
    }
  }

  handleElementDragEnd(index, type, event) {
    const position = event.target.getLatLng()

    this.props.dispatch( MapActions.changElementPosition(index, type,
      [ setDecimalPrecision(position.lat, 6), setDecimalPrecision(position.lng, 6) ]
    ))
  }

  render() {

    const { stops, handleDragEnd, changeCoordinates, dragableMarkers, neighbouringMarkersQuaysMap, missingCoordinatesMap, handleSetCompassBearing } = this.props
    const { formatMessage } = this.props.intl

    let popupMarkers = []

    const CustomPopupMarkerText = {
      untitled: formatMessage({id: 'untitled'}),
      coordinates: formatMessage({id: 'coordinates'}),
      createPathLinkHere: formatMessage({id: 'create_path_link_here'}),
      terminatePathLinkHere: formatMessage({id: 'terminate_path_link_here'}),
      cancelPathLink: formatMessage({id: 'cancel_path_link'}),
      showQuays: formatMessage({id: 'show_quays'}),
      hideQuays: formatMessage({id: 'hide_quays'}),
      inComplete: formatMessage({id: 'path_link_incomplete'})
    }

    const newStopMarkerText = {
      newStopTitle: formatMessage({id: 'new_stop_title'}),
      newStopQuestion: formatMessage({id: 'new_stop_question'}),
      createNow: formatMessage({id: 'create_now'})
    }

    stops.forEach( (stop, stopIndex) => {

      const localeStopType = getLocaleStopTypeName(stop.stopPlaceType, this.props.intl)

      if (stop.isNewStop && !this.props.isEditingStop) {
        popupMarkers.push(
          <NewStopMarker
              key={"newstop-parent- " + stopIndex}
              position={stop.location}
              handleDragEnd={this.handleDragEndNewStop.bind(this)}
              text={newStopMarkerText}
              handleOnClick={() => { this.handleNewStopClick(stop.location)}}
            />
        )

      } else {
        popupMarkers.push(
          (<StopPlaceMarker
            key={"stop-place" + stop.id + 'active' + !!stop.isActive}
            id={stop.id}
            index={stopIndex}
            position={stop.location}
            name={stop.name}
            formattedStopType={localeStopType}
            handleDragEnd={handleDragEnd}
            active={!!stop.isActive}
            stopType={stop.stopPlaceType}
            draggable={dragableMarkers}
            handleChangeCoordinates={changeCoordinates}
            translations={CustomPopupMarkerText}
            handleOnClick={() => { this.handleStopOnClick(stop.id)} }
            handleFetchQuaysForNeighbourStop={this.handleFetchQuaysForNeighbourStop.bind(this)}
            neighbouringMarkersQuaysMap={neighbouringMarkersQuaysMap}
            handleHideQuaysForNeighbourStop={this.handleHideQuaysForNeighbourStop.bind(this)}
            isEditingStop={this.props.isEditingStop}
            missingCoordinatesMap={missingCoordinatesMap}
            />
          )
        )

        if (stop.quays) {
           stop.quays.forEach( (quay, index) => {
              popupMarkers.push(
                <QuayMarker
                  index={index}
                  parentId={stopIndex}
                  id={quay.id}
                  position={quay.location}
                  key={"quay" + (quay.id || index) }
                  handleQuayDragEnd={this.handleElementDragEnd.bind(this)}
                  translations={Object.assign({}, newStopMarkerText, CustomPopupMarkerText)}
                  compassBearing={quay.compassBearing}
                  name={quay.publicCode || ''}
                  parentStopPlaceName={stop.name}
                  formattedStopType={localeStopType}
                  handleUpdatePathLink={this.handleUpdatePathLink.bind(this)}
                  handleChangeCoordinates={changeCoordinates}
                  draggable
                  belongsToNeighbourStop={!stop.isActive}
                  handleSetCompassBearing={handleSetCompassBearing}
                />)
            })
        }

        if (stop.entrances) {

          const junctionMarkerText = {
            junctionTitle: formatMessage({id: 'entrance'})
          }

          stop.entrances.forEach( (entrance, index) => {
            popupMarkers.push(
              <JunctionMarker
                position={entrance.location}
                index={index}
                key={'entrance-'+index}
                type="entrance"
                handleDragEnd={this.handleElementDragEnd.bind(this)}
                handleUpdatePathLink={this.handleUpdatePathLink.bind(this)}
                text={Object.assign({}, junctionMarkerText, CustomPopupMarkerText)}
                name={entrance.name}
              />
            )
          })
        }

        if (stop.pathJunctions) {

          const junctionMarkerText = {
            junctionTitle: formatMessage({id: 'pathJunction'})
          }

          stop.pathJunctions.forEach( (pathJunction, index) => {
            popupMarkers.push(
              <JunctionMarker
                position={pathJunction.location}
                key={'pathjunction-'+index}
                index={index}
                type="pathJunction"
                handleDragEnd={this.handleElementDragEnd.bind(this)}
                handleUpdatePathLink={this.handleUpdatePathLink.bind(this)}
                text={Object.assign({}, junctionMarkerText, CustomPopupMarkerText)}
                name={pathJunction.name}
              />
            )
          })
        }
      }
    })

    return <div>{popupMarkers}</div>
  }
}

const mapStateToProps = state => {
  return {
    path: state.user.path,
    isCreatingPolylines: state.editingStop.isCreatingPolylines,
    neighbouringMarkersQuaysMap: state.editingStop.neighbouringMarkersQuaysMap,
    isEditingStop: state.routing.locationBeforeTransitions.pathname.indexOf('edit') > -1,
    missingCoordinatesMap: state.user.missingCoordsMap,
    activeMap: state.editingStop.activeMap,
    pathLink: state.stopPlace.pathLink
  }
}

const getLocaleStopTypeName = (stopPlaceType, intl) => {
  const { formatMessage, locale } = intl
  let formattedStopTypeId = null
  stopTypes[locale].forEach( (stopType) => {
    if (stopType.value === stopPlaceType) {
      formattedStopTypeId = stopType.quayItemName
    }
  })
  return formattedStopTypeId ? formatMessage({id: formattedStopTypeId || 'name'}) : ''
}

export default withApollo(injectIntl(connect(mapStateToProps)(MarkerList)))
