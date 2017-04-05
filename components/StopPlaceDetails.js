import React from 'react'
import ModalityIcon from '../components/ModalityIcon'
import { Popover, PopoverAnimationVertical } from 'material-ui/Popover'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'
import MenuItem from 'material-ui/MenuItem'
import ImportedId from '../components/ImportedId'
import { MapActions, AssessmentActions } from '../actions/'
import { connect } from 'react-redux'
import TicketMachine from '../static/icons/facilities/TicketMachine'
import BusShelter from '../static/icons/facilities/BusShelter'
import debounce from 'lodash.debounce'
import Checkbox from 'material-ui/Checkbox'
import stopTypes from './stopTypes'
import MdWC from 'material-ui/svg-icons/notification/wc'
import WaitingRoom from '../static/icons/facilities/WaitingRoom'
import BikeParking from '../static/icons/facilities/BikeParking'
import WheelChairPopover from './WheelChairPopover'
import { getIn } from '../utils'

class StopPlaceDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      stopTypeOpen: false,
      name: props.stopPlace.name || '',
      description: props.stopPlace.description || '',
      stepFreeAccess: false,
      ticketMachine: false,
      busShelter: false,
      bikeParking: false,
      waitingRoom: false,
      WC: false
    }

    this.updateStopName = debounce( value => {
      this.props.dispatch(MapActions.changeStopName(value))
    }, 200)

    this.updateStopDescription = debounce( value => {
      this.props.dispatch(MapActions.changeStopDescription(value))
    }, 200)
  }

  componentWillReceiveProps(props) {
    this.setState({
      description: props.stopPlace.description || '',
      name: props.stopPlace.name || ''
    })
  }

  handleCloseStopPlaceTypePopover() {
    this.setState({
      stopTypeOpen: false
    })
  }

  handleOpenStopPlaceTypePopover(event) {
    this.setState({
      stopTypeOpen: true,
      wheelChairOpen: false,
      stopTypeAnchorEl: event.currentTarget
    })
  }

 handleStopNameChange(event) {

    const name = event.target.value
    this.setState({
      name: name
    })

    this.updateStopName(name)
  }

  handleStopDescriptionChange(event) {

    const description = event.target.value
    this.setState({
      description: description
    })

    this.updateStopDescription(description)
  }

  handleHandleWheelChair(value) {
    this.props.dispatch(AssessmentActions.setStopWheelchairAccess(value))
  }


  handleStopTypeChange(value) {
    this.handleCloseStopPlaceTypePopover()
    this.props.dispatch(MapActions.changeStopType(value))
  }

  render() {

    const fixedHeader = {
      position: "relative",
      display: "block"
    }

    const { stopPlace, intl, expanded } = this.props
    const { formatMessage, locale } = intl
    const { name, description, busShelter, ticketMachine, bikeParking, waitingRoom, WC } = this.state

    const wheelchairAccess = getIn(stopPlace, ['accessibilityAssessment', 'limitations', 'wheelchairAccess'], 'UNKNOWN')

    return (
      <div style={fixedHeader}>
        <ImportedId id={stopPlace.importedId} text={formatMessage({id: 'local_reference'})}/>
        <TextField
          hintText={formatMessage({id: 'name'})}
          floatingLabelText={formatMessage({id: 'name'})}
          style={{width: 295, marginTop: -10}}
          value={name}
          onChange={this.handleStopNameChange.bind(this)}
        />
        <IconButton
          style={{marginLeft: 30, borderBottom: '1px dotted grey'}}
          onClick={(e) => { this.handleOpenStopPlaceTypePopover(e) }}
        >
          <ModalityIcon
            type={ stopPlace.stopPlaceType }
          />
        </IconButton>
        <Popover
          open={this.state.stopTypeOpen}
          anchorEl={this.state.stopTypeAnchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleCloseStopPlaceTypePopover.bind(this)}
          animation={PopoverAnimationVertical}
        >
          { stopTypes[locale].map( (type, index) =>
            <MenuItem
              key={'stopType' + index}
              value={type.value}
              style={{padding: '0px 10px'}}
              primaryText={type.name}
              onClick={() => { this.handleStopTypeChange(type.value) }}
              secondaryText={(
                <ModalityIcon
                  iconStyle={{float: 'left', marginLeft: -18, marginTop: 9}}
                  type={type.value}
                />)}
            />
          ) }
        </Popover>
        <TextField
          hintText={formatMessage({id: 'description'})}
          floatingLabelText={formatMessage({id: 'description'})}
          style={{width: 295, marginTop: -10}}
          value={description}
          onChange={this.handleStopDescriptionChange.bind(this)}
        />
        { expanded
          ? null
          : <div style={{marginTop: 10, marginBottom: 10, height: 15, display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
              <WheelChairPopover intl={intl} handleChange={this.handleHandleWheelChair.bind(this)} wheelchairAccess={wheelchairAccess} />
              <Checkbox
                checkedIcon={<TicketMachine />}
                uncheckedIcon={<TicketMachine style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
                style={{width: 'auto'}}
                checked={ticketMachine}
                onCheck={(e,v) => this.setState({ticketMachine: v})}
              />
              <Checkbox
                checkedIcon={<BusShelter />}
                uncheckedIcon={<BusShelter style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
                style={{width: 'auto'}}
                checked={busShelter}
                onCheck={(e,v) => this.setState({busShelter: v})}
              />
              <Checkbox
                checkedIcon={<MdWC />}
                uncheckedIcon={<MdWC style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
                style={{width: 'auto'}}
                checked={WC}
                onCheck={(e,v) => this.setState({WC: v})}
              /><Checkbox
              checkedIcon={<WaitingRoom />}
              uncheckedIcon={<WaitingRoom style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
              style={{width: 'auto'}}
              checked={waitingRoom}
              onCheck={(e,v) => this.setState({waitingRoom: v})}
            />
              <Checkbox
                checkedIcon={<BikeParking />}
                uncheckedIcon={<BikeParking style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
                style={{width: 'auto'}}
                checked={bikeParking}
                onCheck={(e,v) => this.setState({bikeParking: v})}
              />
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  stopPlace: state.stopPlace.current
})



export default connect(mapStateToProps)(StopPlaceDetails)