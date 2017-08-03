import React from 'react';
import PropTypes from 'prop-types';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import ReactDOM from 'react-dom/server';
import { connect } from 'react-redux';
import compassIcon from '../../static/icons/compass.png';
import { UserActions, StopPlaceActions } from '../../actions/';
import OSMIcon from '../../static/icons/osm_logo.png';
import { getIn } from '../../utils/';
import ToolTippable from '../EditStopPage/ToolTippable';
import Code from '../EditStopPage/Code';
import { compareShallowQuayMarker as shallowCompare } from './shallowCompare/';
import QuayMarkerIcon from './QuayMarkerIcon';

class QuayMarker extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    id: PropTypes.string,
    parentId: PropTypes.number.isRequired,
    parentStopPlaceName: PropTypes.string.isRequired,
    position: PropTypes.arrayOf(Number),
    publicCode: PropTypes.string.isRequired,
    privateCode: PropTypes.string.isRequired,
    translations: PropTypes.object.isRequired,
    handleQuayDragEnd: PropTypes.func.isRequired,
    formattedStopType: PropTypes.string.isRequired,
    handleUpdatePathLink: PropTypes.func.isRequired,
    isCreatingPolylines: PropTypes.bool.isRequired,
    handleChangeCoordinates: PropTypes.func,
    draggable: PropTypes.bool.isRequired,
    handleSetCompassBearing: PropTypes.func
  };

  getOSMURL() {
    const { position } = this.props;
    return `https://www.openstreetmap.org/edit#map=18/${position[0]}/${position[1]}`;
  }

  handleMergeFrom() {
    const { id, dispatch } = this.props;
    dispatch(UserActions.startMergingQuayFrom(id));
  }

  handleMergeTo() {
    const { id, dispatch } = this.props;
    dispatch(UserActions.endMergingQuayTo(id));
  }

  handleCancelMerge() {
    this.props.dispatch(UserActions.cancelMergingQuayFrom());
  }

  handleSetFocus() {
    const { dispatch, index } = this.props;
    dispatch(StopPlaceActions.setElementFocus(index, 'quay'));
    document.querySelector(".quay-item-expanded").scrollIntoView(true);
    document.querySelector("#scroll-body").scrollTop -= 50;
  }

  handleMoveQuay() {
    this.props.dispatch(UserActions.moveQuay({
      id: this.props.id,
      privateCode: this.props.privateCode,
      publicCode: this.props.publicCode
    }));
  }

  handleMoveQuayToNewStop() {
    this.props.dispatch(UserActions.moveQuayToNewStopPlace({
      id: this.props.id,
      privateCode: this.props.privateCode,
      publicCode: this.props.publicCode
    }));
  }

  shouldComponentUpdate(nextProps) {
    return shallowCompare(this, nextProps);
  }

  render() {
    const {
      position,
      privateCode,
      publicCode,
      index,
      handleQuayDragEnd,
      parentStopPlaceName,
      formattedStopType,
      handleUpdatePathLink,
      translations,
      handleChangeCoordinates,
      belongsToNeighbourStop,
      isEditingStop,
      currentIsNewStop,
      isCreatingPolylines,
      id,
      pathLink,
      showPathLink,
      disabled,
      mergingQuay
    } = this.props;

    if (!position) return null;

    let isIncomplete = false;

    let pathLinkText = isCreatingPolylines
      ? translations.terminatePathLinkHere
      : translations.createPathLinkHere;

    if (isCreatingPolylines && pathLink && pathLink.length) {
      let lastPathLink = pathLink[pathLink.length - 1];
      let fromId = getIn(
        lastPathLink,
        ['from', 'placeRef', 'addressablePlace', 'id'],
        null
      );

      if (fromId === id) {
        pathLinkText = translations.cancelPathLink;
      } else {
        // LineString should either have 0 or >= 2 [long,lat] according to GeoJSON spec
        if (lastPathLink.inBetween && lastPathLink.inBetween.length == 1) {
          isIncomplete = true;
        }
      }
    }

    const divBody = ReactDOM.renderToStaticMarkup(
      <QuayMarkerIcon
        isEditingStop={isEditingStop}
        index={index}
        publicCode={publicCode}
        privateCode={privateCode}
        focusedElement={this.props.focusedElement}
        compassBearing={this.props.compassBearing}
        isCompassBearingEnabled={this.props.isCompassBearingEnabled}
        belongsToNeighbourStop={belongsToNeighbourStop}
      />
    );

    let quayIcon = divIcon({
      html: divBody,
      iconSize: [22, 35],
      iconAnchor: [11, 35],
      popupAnchor: [5, 0]
    });

    const osmURL = this.getOSMURL();
    const shouldShowMergeQuay =
      isEditingStop && !disabled && !belongsToNeighbourStop && !!id && !currentIsNewStop;
    const isMergingFromThis =
      id && mergingQuay.fromQuay && mergingQuay.fromQuay.id && id === mergingQuay.fromQuay.id;
    const shouldShowMoveQuay =
      isEditingStop && !disabled && belongsToNeighbourStop && !!id && !currentIsNewStop;

    return (
      <Marker
        position={position}
        icon={quayIcon}
        draggable={this.props.draggable}
        onDragend={event => {
          handleQuayDragEnd(index, 'quay', event);
        }}
        keyboard={false}
      >
        <Popup autoPan={false} onOpen={() => { this.handleSetFocus() }}>
          <div>
            <span className="quay-marker-title">
              {parentStopPlaceName}
            </span>
            <div
              className="quay-marker-title"
              style={{
                marginTop: -2,
                marginBottom: 5,
                fontSize: '1em',
                color: '#191919',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div>{formattedStopType}</div>
              <ToolTippable toolTipText={translations.publicCode}>
                <Code type="publicCode" value={publicCode}/>
              </ToolTippable>
              <ToolTippable toolTipText={translations.privateCode}>
                <Code type="privateCode" value={privateCode}/>
              </ToolTippable>
            </div>
            <div
              style={{
                display: 'block',
                cursor: 'pointer',
                width: 'auto',
                textAlign: 'center',
                fontSize: 10
              }}
              onClick={() =>
                !belongsToNeighbourStop &&
                handleChangeCoordinates(true, index, position)}
            >
              <span
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  borderBottom: !belongsToNeighbourStop
                    ? '1px dotted black'
                    : 'none'
                }}
              >
                {position[0]}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: 3,
                  borderBottom: !belongsToNeighbourStop
                    ? '1px dotted black'
                    : 'none'
                }}
              >
                {position[1]}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10
              }}
            >
              {belongsToNeighbourStop || !this.props.draggable
                ? null
                : <div
                    onClick={() => {
                      this.props.handleSetCompassBearing(
                        this.props.compassBearing,
                        index
                      );
                    }}
                  >
                    <img
                      style={{ width: 20, height: 22, cursor: 'pointer' }}
                      src={compassIcon}
                    />
                  </div>}
              <div
                style={{
                  marginLeft: belongsToNeighbourStop ? 0 : 10,
                  cursor: 'pointer'
                }}
              >
                <a href={osmURL} target="_blank">
                  <img
                    style={{
                      width: 20,
                      height: 22,
                      border: '1px solid grey',
                      borderRadius: 50
                    }}
                    src={OSMIcon}
                  />
                </a>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              {shouldShowMoveQuay &&
                <div style={{ textAlign: 'center' }}>
                  <span
                    className="marker-popup-button"
                    onClick={() => this.handleMoveQuay()}
                  >
                    {translations.moveQuayToCurrent}
                  </span>
                </div>}
              {shouldShowMergeQuay &&
                <div style={{ textAlign: 'center' }}>
                  {mergingQuay.isMerging
                    ? <div>
                        {isMergingFromThis
                          ? <span
                              className="marker-popup-button"
                              onClick={() => this.handleCancelMerge()}
                            >
                              {translations.mergeQuayCancel}
                            </span>
                          : <span
                              className="marker-popup-button"
                              onClick={() => this.handleMergeTo()}
                            >
                              {translations.mergeQuayTo}
                            </span>}
                      </div>
                    : <div>
                        <span
                          className="marker-popup-button"
                          onClick={() => this.handleMergeFrom()}
                        >
                          {translations.mergeQuayFrom}
                        </span>
                      </div>}
                  { !disabled &&
                    <div style={{marginTop: 10}}>
                      <span
                        className="marker-popup-button"
                        onClick={() => this.handleMoveQuayToNewStop()}
                      >
                        {translations.moveQuaysToNewStop}
                      </span>
                    </div>
                  }
                </div>}
            </div>
            <div style={{ marginTop: 10 }}>
              {showPathLink && isEditingStop && !currentIsNewStop
                ? <div>
                  {id
                    ? <div
                      className={`marker-popup-button ${isIncomplete
                        ? 'incomplete'
                        : ''}`}
                      onClick={() => {
                        handleUpdatePathLink(position, id, 'quay');
                      }}
                    >
                      {pathLinkText}
                      {isIncomplete && <div>{translations.inComplete}</div>}
                      </div>
                    : <div
                      style={{
                        textAlign: 'center',
                        padding: 10,
                        border: '1px solid #9E9E9E'
                      }}
                    >
                      {translations.saveFirstPathLink}
                    </div>}
                </div>
                : null}
            </div>
          </div>
        </Popup>
      </Marker>
    );
  }
}

const mapStateToProps = state => ({
  isCreatingPolylines: state.stopPlace.isCreatingPolylines,
  isCompassBearingEnabled: state.stopPlace.isCompassBearingEnabled,
  focusedElement: state.mapUtils.focusedElement,
  mergingQuay: state.mapUtils.mergingQuay,
  pathLink: state.stopPlace.pathLink,
});

export default connect(mapStateToProps)(QuayMarker);