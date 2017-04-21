import { connect } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import AutoComplete from 'material-ui/AutoComplete'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import { MapActions, UserActions } from '../actions/'
import SearchBoxDetails from '../components/SearchBoxDetails'
import cfgreader from '../config/readConfig'
import NewStopPlace from '../components/NewStopPlace'
import { injectIntl } from 'react-intl'
import MenuItem from 'material-ui/MenuItem'
import ModalityIcon from '../components/ModalityIcon'
import SearchIcon from 'material-ui/svg-icons/action/search'
import FavoriteManager from '../singletons/FavoriteManager'
import CoordinatesDialog from '../components/CoordinatesDialog'
import { findStop } from "../actions/Queries"
import { withApollo } from 'react-apollo'
import FavoritePopover from '../components/FavoritePopover'
import ModalityFilter from '../components/ModalityFilter'
import FavoriteNameDialog from '../components/FavoriteNameDialog'
import TopographicalFilter from '../components/TopographicalFilter'
import Divider from 'material-ui/Divider'
import MdMore from 'material-ui/svg-icons/navigation/more-vert'
import MdLess from 'material-ui/svg-icons/navigation/expand-less'

class SearchBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      showMoreFilterOptions: false,
      coordinatesDialogOpen: false
    }
  }

  componentDidMount() {
    cfgreader.readConfig( (function(config) {
      window.config = config
      this.refs.searchText.focus()
    }).bind(this))
  }

  handleEdit(id) {
    this.props.dispatch(UserActions.navigateTo('/edit/', id ))
  }

  handleSaveAsFavorite() {
    this.props.dispatch(UserActions.openFavoriteNameDialog())
  }

  handleRetrieveFilter(filter) {
    this.props.dispatch(UserActions.loadFavoriteSearch(filter))
    this.handleUpdateInput(filter.searchText, null, null, filter)

    this.refs.searchText.setState({
      open: true,
      anchorEl: ReactDOM.findDOMNode(this.refs.searchText)
    })
  }

  handlePopoverDismiss(filters) {
    this.props.dispatch( UserActions.applyStopTypeSearchFilter(filters) )
  }

  handleUpdateInput(searchText, dataSource, params, filter) {

    if (!searchText || !searchText.length) {
      /* This is a work-around to solve bug in Material-UI causing handleUpdateInput to
       be fired upon handleNewRequest
       */
    } else if (searchText.indexOf('(') > -1 && searchText.indexOf(')') > -1) {
      return
    }
    else {

      const isImportedId = !isNaN(searchText) || searchText.indexOf(':StopArea:') > -1

      const chips = filter ? filter.topoiChips : this.props.topoiChips
      const stopPlaceTypes = filter ? filter.stopType : this.props.stopTypeFilter

      this.props.client.query({
        query: findStop,
        fetchPolicy: 'network-only',
        variables: {
          query: searchText,
          importedId: isImportedId ? searchText : null,
          stopPlaceType: stopPlaceTypes,
          municipalityReference: chips
            .filter( topos => topos.type === "town").map(topos => topos.value),
          countyReference: this.props.topoiChips
            .filter( topos => topos.type === "county").map(topos => topos.value)
        }
      })
      this.props.dispatch(UserActions.setSearchText(searchText))
    }
  }

  handleNewRequest(result) {
    if (typeof(result.element) !== 'undefined') {
      this.props.dispatch( MapActions.setMarkerOnMap(result.element) )
    }
  }

  handleChangeCoordinates() {
    this.setState({
      coordinatesDialogOpen: true
    })
   }

  handleSubmitCoordinates(position) {
    this.props.dispatch( MapActions.changeMapCenter(position, 11))
    this.props.dispatch( UserActions.setMissingCoordinates(  position, this.props.chosenResult.id ))

    this.setState(({
      coordinatesDialogOpen: false
    }))
  }

  handleAddChip({ text, type, id }) {
    this.props.dispatch(UserActions.addToposChip({text: text, type: type, value: id}))
    this.refs.topoFilter.setState({
      searchText: ''
    })
  }
  handleNewStop() {
    this.props.dispatch(UserActions.toggleIsCreatingNewStop())
  }

  handleClearSearch() {
    this.refs.searchText.setState({
      searchText: ''
    })
    this.props.dispatch(UserActions.setSearchText(''))
  }

  handleToggleFilter(value) {
    this.setState({
      showMoreFilterOptions: value
    })
  }

  componentWillUpdate(nextProps) {

    const {  dataSource = [] } = nextProps
    const { formatMessage } = nextProps.intl

    if (dataSource.length) {
      this._menuItems = dataSource.map( element => ({
          element: element,
          text: element.name,
          value: (
            <MenuItem
              style={{marginTop:5, paddingRight: 5, width: 'auto'}}
              innerDivStyle={{minWidth: 300, padding: '0px 16px 0px 0px'}}
              primaryText={(
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div style={{fontSize: '0.9em'}}>{element.name}</div>
                  <div style={{display: 'flex', flexDirection: 'column', color: 'grey', fontSize: '0.7em', justifyContent: 'space-between'}}>
                    <div style={{marginBottom: 0}}>{`${element.topographicPlace}, ${element.parentTopographicPlace}`}</div>
                    <div style={{marginTop: -30}}>{element.id}</div>
                  </div>
                </div>
              )}
              leftIcon={(
                <ModalityIcon
                  svgStyle={{marginRight: 10}}
                  isStatic={true}
                  style={{display: 'inline-block', position: 'relative'}}
                  type={element.stopPlaceType}
                />
              )}
            />
          )}
      ))
    } else {
       this._menuItems = [{
         text: '',
         value:
           (<MenuItem
             style={{paddingRight: 10, width: 'auto'}}
             primaryText={(
               <div style={{fontWeight: 600, fontSize: '0.8em'}}>
                 { formatMessage({id: 'no_results_found'}) }
               </div>
             )}
         />)
       }]
    }
  }

  render() {

    const { chosenResult, isCreatingNewStop, favorited, missingCoordinatesMap, intl, stopTypeFilter, topoiChips } = this.props
    const { coordinatesDialogOpen, showMoreFilterOptions } = this.state
    const { formatMessage, locale } = intl

    const data = [] // TODO : replace this by data from Tiamat
    const topographicalPlaces = !data.topographicPlace
      ? []
      : data.topographicPlace
        .filter( place => topoiChips.map( chip => chip.value ).indexOf(place.id) == -1)
        .map( place => ({
          text: place.name.value,
          id: place.id,
          value: (
            <MenuItem
              primaryText={place.name.value}
              secondaryText={ formatMessage({id: place.topographicPlaceType}) }
            />
          ),
          type: place.topographicPlaceType
        }))

    const newStopText = {
      headerText: formatMessage({id: 'making_stop_place_title'}),
      bodyText: formatMessage({id: 'making_stop_place_hint'})
    }

    let favoriteText = {
      title: formatMessage({id: 'favorites_title'}),
      noFavoritesFoundText: formatMessage({id: 'no_favorites_found'})
    }

    const text = {
      emptyDescription: formatMessage({id: 'empty_description'}),
      edit: formatMessage({id: 'edit'})
    }

    const searchBoxWrapperStyle = {
      top: 90,
      background: "white",
      height: "auto",
      width: 460,
      margin: 10,
      position: "absolute",
      zIndex: 999,
      padding: 10,
      border: "1px solid rgb(81, 30, 18)"
    }

    return (
      <div>
        <CoordinatesDialog
          open={coordinatesDialogOpen}
          handleClose={ () => this.setState({coordinatesDialogOpen: false})}
          handleConfirm={this.handleSubmitCoordinates.bind(this)}
          intl={intl}
        />
        <FavoriteNameDialog/>
        <div style={searchBoxWrapperStyle}>
          <div key='search-name-wrapper'>
            <FavoritePopover
              caption={formatMessage({id: "favorites"})}
              items={[]}
              filter={stopTypeFilter}
              onItemClick={this.handleRetrieveFilter.bind(this)}
              onDismiss={this.handlePopoverDismiss.bind(this)}
              text={favoriteText}
            />
            <SearchIcon style={{verticalAlign: 'middle', marginRight: 5, height: 22, width: 22}}/>
            <AutoComplete
              textFieldStyle={{width: 380}}
              animated={true}
              openOnFocus
              hintText={formatMessage({id: "filter_by_name"})}
              dataSource={this._menuItems || []}
              filter={(searchText, key) => searchText !== ''}
              onUpdateInput={this.handleUpdateInput.bind(this)}
              maxSearchResults={7}
              searchText={this.props.searchText}
              ref="searchText"
              onNewRequest={this.handleNewRequest.bind(this)}
              listStyle={{width: 'auto'}}
            />
            <div style={{float: "right"}}>
              <IconButton style={{verticalAlign: 'middle'}}  iconStyle={{fontSize: 22}} onClick={this.handleClearSearch.bind(this)}  iconClassName="material-icons">
                clear
              </IconButton>
            </div>
            <Divider/>
          </div>
          <div style={{marginBottom: 15, textAlign: 'right', marginRight: 10}}>
            <FlatButton
              style={{marginLeft: 10, fontSize: 12}}
              disabled={!!favorited}
              secondary={true}
              onClick={() => { this.handleSaveAsFavorite(!!favorited) }}
            >
              {formatMessage({id: 'filter_save_favorite'})}
            </FlatButton>
          </div>
          <div style={{width: '90%', margin: 'auto', border: '1px solid hsla(182, 53%, 51%, 0.1)'}}>
            <ModalityFilter locale={locale}/>
            { showMoreFilterOptions ?
              <div>
                <div style={{width: '100%', textAlign: 'center'}}>
                  <FlatButton
                    icon={<MdLess style={{height: 18, width: 18}}/>}
                    onClick={() => this.handleToggleFilter(false)}
                  />
                </div>
                <AutoComplete
                  hintText={formatMessage({id: "filter_by_topography"})}
                  dataSource={topographicalPlaces}
                  filter={AutoComplete.caseInsensitiveFilter}
                  style={{margin: 'auto', width: '100%', textAlign: 'center'}}
                  maxSearchResults={5}
                  fullWidth={true}
                  ref="topoFilter"
                  onNewRequest={this.handleAddChip.bind(this)}
                />
                <TopographicalFilter/>
              </div>
              :  <div style={{width: '100%', textAlign: 'center'}}>
                <FlatButton
                  icon={<MdMore style={{height: 20, width: 20}}/>}
                  onClick={() => this.handleToggleFilter(true)}
                />
              </div>
            }
          </div>
          <div key='searchbox-edit'>
            { chosenResult
              ?  <SearchBoxDetails
                   handleEdit={this.handleEdit.bind(this)}
                   result={chosenResult}
                   handleChangeCoordinates={this.handleChangeCoordinates.bind(this)}
                   userSuppliedCoordinates={missingCoordinatesMap && missingCoordinatesMap[chosenResult.id]}
                   text={text}
              />
              :  null
            }
            <div style={{marginTop: 30}}>
              { isCreatingNewStop
                ? <NewStopPlace text={newStopText}/>
                :
                <RaisedButton
                  onClick={this.handleNewStop.bind(this)}
                  style={{float: "right"}}
                  icon={<ContentAdd/>}
                  primary={true}
                  label={formatMessage({id: 'new_stop'})}
                />
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {

  var favoriteManager = new FavoriteManager()
  const { stopType, topoiChips, text } = state.user.searchFilters
  var favoriteContent = favoriteManager.createSavableContent('', text, stopType, topoiChips)
  var favorited = favoriteManager.isFavoriteAlreadyStored(favoriteContent)

  return {
    chosenResult: state.stopPlace.activeSearchResult,
    dataSource: state.stopPlace.searchResults,
    isCreatingNewStop: state.user.isCreatingNewStop,
    stopTypeFilter: state.user.searchFilters.stopType,
    topoiChips: state.user.searchFilters.topoiChips,
    favorited: favorited,
    missingCoordinatesMap: state.user.missingCoordsMap,
    searchText: state.user.searchFilters.text
  }
}

export default withApollo(injectIntl(connect(mapStateToProps)(SearchBox)))
