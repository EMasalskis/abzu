import * as types from './../actions/actionTypes'

export const initialState = {
  centerPosition: [ 61.670029, 6.442342 ],
  activeMarker: null,
  neighbouringMarkers: [],
  zoom: 7,
  stopPlaceNames: {
    isLoading: false,
    errorMessage: '',
    places: [],
    cancelToken: null
  },
  activeStopPlace: {}
}

const stopPlacesReducer = (state = initialState, action) => {

  switch (action.type) {

    case types.CHANGED_MAP_CENTER:
      return Object.assign({}, state, {centerPosition: action.payLoad})

    case types.SET_ACTIVE_MARKER:
      return Object.assign({}, state, {activeMarker: action.payLoad})

    case types.CREATED_NEW_STOP:
      return Object.assign({}, state, { newStopPlace: action.payLoad })

    case types.DESTROYED_NEW_STOP:
      return Object.assign({}, state, { newStopPlace: undefined })

    case types.SET_ZOOM:
      return Object.assign({}, state, {zoom: action.payLoad})

    case types.RECEIVED_DATASOURCE:
      return Object.assign({}, state, {dataSource: action.payLoad})

    case types.REQUESTED_STOP_NAMES:

      if (state.stopPlaceNames && state.stopPlaceNames.cancelToken) {
        let cancelToken = state.stopPlaceNames.cancelToken
        cancelToken('Operation canceled by new request.')
      }

      return Object.assign({}, state, { stopPlaceNames: { isLoading: true, cancelToken: action.payLoad } } )

    case types.RECEIVED_STOP_NAMES:
      return Object.assign({}, state, {  stopPlaceNames: { places: action.payLoad, isLoading: false } } )

    case types.ERROR_STOP_NAMES:
      return Object.assign({}, state, { stopPlaceNames: { errorMessage: action.payLoad, isLoading: false } } )

    case types.RECEIVED_STOPS_OVERVIEW_NEARBY:
      return Object.assign({}, state, {
        neighbouringMarkers: action.payLoad })

    case types.REMOVED_STOPS_NEARBY_FOR_OVERVIEW:
      return Object.assign({}, state, { neighbouringMarkers: [] })

    default:
      return state
  }
}

export default stopPlacesReducer
