/*
 *  Licensed under the EUPL, Version 1.2 or – as soon they will be approved by
 the European Commission - subsequent versions of the EUPL (the "Licence");
 You may not use this work except in compliance with the Licence.
 You may obtain a copy of the Licence at:

 https://joinup.ec.europa.eu/software/page/eupl

 Unless required by applicable law or agreed to in writing, software
 distributed under the Licence is distributed on an "AS IS" basis,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the Licence for the specific language governing permissions and
 limitations under the Licence. */

import React, {Component} from 'react';
import StopPlaceGroup from './StopPlaceGroup';
import { connect } from 'react-redux';
import { Entities } from '../../models/Entities';

const StopPlaceGroupList = ({list}) => (
  list.map(({positions, name}, index) => (
    <StopPlaceGroup key={index} positions={positions} name={name}/>
  ))
);

const getSearchPolygon = result => {
  if (!result || result.entityType !== Entities.GROUP_OF_STOP_PLACE) {
    return null;
  }

  return ({
    name: result.name,
    positions: [result.members.map(member => member.location)]
  });
};

const mapStateToProps = ({stopPlace, stopPlacesGroup}) => {
  let list = [{
    name: stopPlacesGroup.current.name,
    positions: [stopPlacesGroup.current.members.map(member => member.location)]
  }];

  const searchPolygon = getSearchPolygon(stopPlace.activeSearchResult);

  if (searchPolygon) {
    list = list.concat(searchPolygon);
  }

  return ({list});
};


export default connect(mapStateToProps)(StopPlaceGroupList);
