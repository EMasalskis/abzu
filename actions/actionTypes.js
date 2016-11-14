// MapActions
export const CHANGED_MAP_CENTER = 'CHANGED_MAP_CENTER'
export const SET_ACTIVE_MARKER = 'SET_ACTIVE_MARKERS'
export const SET_ZOOM = 'SET_ZOOM'
export const ADDED_NEW_QUAY = 'ADDED_NEW_QUAY'
export const REMOVED_QUAY = 'REMOVED_QUAY'
export const CHANGED_QUAY_NAME = 'CHANGED_QUAY_NAME'
export const CHANGED_QUAY_DESCRIPTION = 'CHANGED_QUAY_DESCRIPTION'
export const CHANGED_QUAY_POSITION = 'CHANGED_QUAY_POSITION'
export const CHANGED_ACTIVE_STOP_POSITION = 'CHANGED_ACTIVE_STOP_POSITION'
export const CHANGED_WHA = 'CHANGED_WHA' // i.e. wheelchairAccessability
export const CHANGED_STOP_NAME = 'CHANGED_STOP_NAME'
export const CREATED_NEW_STOP = 'CREATE_NEW_STOP'
export const DESTROYED_NEW_STOP = 'DESTROYED_NEW_STOP'
export const CHANGED_STOP_DESCRIPTION = 'CHANGED_STOP_DESCRIPTION'
export const CHANGED_STOP_TYPE = 'CHANGED_STOP_TYPE'
export const RESTORED_TO_ORIGINAL_STOP_PLACE = 'RESTORED_TO_ORIGINAL_STOP_PLACE'

// AjaxActions
export const RECEIVED_DATASOURCE = 'RECEIVED_DATASOURCE'

export const REQUESTED_STOP_NAMES = 'REQUESTED_STOP_NAMES'
export const RECEIVED_STOP_NAMES = 'RECEIVED_STOP_NAMES'
export const ERROR_STOP_NAMES = 'ERROR_STOP_NAMES'

export const REQUESTED_STOP = 'REQUESTED_STOP'
export const RECEIVED_STOP = 'RECEIVED_STOP'
export const ERROR_STOP = 'ERROR_STOP'

export const SUCCESS_STOP_SAVED = 'SUCCESS_STOP_SAVED'
export const ERROR_STOP_SAVED = 'ERROR_STOP_SAVED'

export const REQUESTED_STOPS_EDITING_NEARBY = 'REQUESTED_STOPS_EDITING_NEARBY'
export const RECEIVED_STOPS_EDITING_NEARBY = 'RECEIVED_STOPS_EDITING_NEARBY'
export const ERROR_STOPS_EDITING_NEARBY = 'ERROR_STOPS_EDITING_NEARBY'
export const RECEIVED_TOPOGRAPHICAL_PLACES = 'RECEIVED_TOPOGRAPHICAL_PLACES'

export const RECEIVED_STOPS_OVERVIEW_NEARBY = 'RECEIVED_STOPS_OVERVIEW_NEARBY'
export const ERROR_STOPS_OVERVIEW_NEARBY = 'ERROR_STOPS_OVERVIEW_NEARBY'

// UserActions
export const NAVIGATE_TO = 'NAVIGATE_TO'
export const TOGGLED_IS_CREATING_NEW_STOP = 'TOGGLED_IS_CREATING_NEW_STOP'
export const APPLIED_STOPTYPE_SEARCH_FILTER = 'APPLIED_STOPTYPE_SEARCH_FILTER'
export const OPENED_SNACKBAR = 'OPENED_SNACKBAR'
export const DISMISSED_SNACKBAR = 'DISMISSED_SNACKBAR'
export const CHANGED_LOCALIZATION = 'CHANGED_LOCALIZATION'
export const APPLIED_LOCALE = 'APPLIED_LOCALE'
export const GET_TOPOGRAPHICAL_PLACES = 'GET_TOPOGRAPHICAL_PLACES'
export const ADDED_TOPOS_CHIP = 'ADDED_TOPOS_CHIP'
export const DELETED_TOPOS_CHIP = 'DELETED_TOPOS_CHIP'
export const SET_TOPOS_CHIPS = 'SET_TOPOS_CHIPS'
export const SET_STOP_PLACE_TYPES = 'SET_STOP_PLACE_TYPES'
export const SET_SEARCH_TEXT = 'SET_SEARCH_TEXT'
export const OPENED_FAVORITE_NAME_DIALOG = 'OPENED_FAVORITE_NAME_DIALOG'
export const CLOSED_FAVORITE_NAME_DIALOG = 'CLOSED_FAVORITE_NAME_DIALOG'
export const REMOVE_SEARCH_AS_FAVORITE = 'REMOVE_SEARCH_AS_FAVORITE'
export const CHANGED_ACTIVE_BASELAYER = 'CHANGED_ACTIVE_BASELAYER'
export const REMOVED_STOPS_NEARBY_FOR_OVERVIEW = 'REMOVED_STOPS_NEARBY_FOR_OVERVIEW'
export const TOGGLED_IS_MULTIPOLYLINES_ENABLED = 'TOGGLED_IS_MULTIPOLYLINES_ENABLED'

//Snackbar types
export const SNACKBAR_MESSAGE_SAVED = 'snackbar_message_saved'
export const SNACKBAR_MESSAGE_FAILED = 'snackbar_message_failed'
