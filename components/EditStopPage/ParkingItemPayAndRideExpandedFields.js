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

import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { injectIntl } from 'react-intl';
import parkingPaymentProcessKeys from '../../models/parkingPaymentProcess';
import { TextField, Divider, Paper, Subheader } from 'material-ui';
import RechargingAvailablePopover from './RechargingAvailablePopover';
import LocalParking from 'material-ui/svg-icons/maps/local-parking';
import { ActionAccessible } from 'material-ui/svg-icons';
import Payment from 'material-ui/svg-icons/action/payment';

const hasElements = list => list && list.length > 0;

const hasValue = value => value !== null && value !== undefined;

const getRechargingAvailableValue = value => hasValue(value) ? value : null;

const parkingPaymentProcessSelectFieldValue = (parkingPaymentProcess) => {
  return hasElements(parkingPaymentProcess) ? parkingPaymentProcess.map(value => `${value}`) : null;
}

const parkingIconStyles = (topMargin = 10) => ({
  margin: `${topMargin}px 22px 18px 10px`
});

const ParkingItemPayAndRideExpandedFields = (props) => {
  const {
    intl: { formatMessage },
    disabled,
    hasExpired,
    parkingPaymentProcess,
    rechargingAvailable,
    totalCapacity,
    numberOfSpaces,
    numberOfSpacesWithRechargePoint,
    numberOfSpacesForRegisteredDisabledUserType,
    handleSetParkingPaymentProcess,
    handleSetRechargingAvailable,
    handleSetNumberOfSpaces,
    handleSetNumberOfSpacesWithRechargePoint,
    handleSetNumberOfSpacesForRegisteredDisabledUserType,
  } = props;

  const parkingPaymentProcessesMenuItems = parkingPaymentProcessKeys.map(key => (
    <MenuItem
      checked={hasElements(parkingPaymentProcess) && parkingPaymentProcess.indexOf(key) > -1}
      key={key}
      value={key}
      primaryText={formatMessage({ id: `parking_payment_process_${key}` })}
      title={key === `payByPrepaidToken` ? formatMessage({ id: `parking_payment_process_${key}_hover`}) : null }/>
  ));

  return (
    <div>
      <div style={{display: 'flex', flexDirection: 'row' }}>
        <Payment style={parkingIconStyles(34)} />
        <SelectField
          multiple
          disabled={disabled || hasExpired}
          floatingLabelText={formatMessage({ id: 'parking_payment_process' })}
          value={parkingPaymentProcessSelectFieldValue(parkingPaymentProcess)}
          onChange={(_e,_i,value) => {
            handleSetParkingPaymentProcess(value);
          }}>
            {parkingPaymentProcessesMenuItems}
        </SelectField>
      </div>
      <Subheader>{formatMessage({id: 'parking_parkAndRide_capacity_sub_header'})} ({`${totalCapacity}`})</Subheader>
      <div style={{display: 'flex', flexDirection: 'row' }}>
        <LocalParking style={parkingIconStyles()} />
        <TextField
          disabled={disabled || hasExpired}
          floatingLabelText={formatMessage({ id: 'parking_number_of_spaces' })}
          onChange={(_e, value) => {
            handleSetNumberOfSpaces(value);
          }}
          value={numberOfSpaces}
          type="number"
          style={{ width: '95%', marginTop: -10 }} />
      </div>
      <div style={{display: 'flex', flexDirection: 'row' }}>
        <ActionAccessible style={parkingIconStyles()} />
        <TextField
          hintText={formatMessage({ id: 'parking_number_of_spaces_for_registered_disabled_user_type' })}
          disabled={disabled || hasExpired}
          floatingLabelText={formatMessage({ id: 'parking_number_of_spaces_for_registered_disabled_user_type' })}
          onChange={(e, value) => {
            handleSetNumberOfSpacesForRegisteredDisabledUserType(value);
          }}
          value={numberOfSpacesForRegisteredDisabledUserType}
          type="number"
          style={{ width: '95%', marginTop: -10 }} />
      </div>
      <Subheader>{formatMessage({id: 'parking_recharging_sub_header'})}</Subheader>
      <p style={{
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '12px',
        paddingLeft: '16px',
        width: '100%',
        marginBlockStart: 0
      }}>
        {formatMessage({id: 'parking_recharging_available_info'})}
      </p>
      <div style={{display: 'flex', flexDirection: 'row' }}>
        <RechargingAvailablePopover
          disabled={disabled}
          hasExpired={hasExpired}
          handleSetRechargingAvailable={handleSetRechargingAvailable}
          handleSetNumberOfSpacesWithRechargePoint={handleSetNumberOfSpacesWithRechargePoint}
          rechargingAvailableValue={getRechargingAvailableValue(rechargingAvailable)} />
        <TextField
          hintText={formatMessage({ id: 'parking_number_of_spaces_with_recharge_point' })}
          disabled={!rechargingAvailable || disabled || hasExpired}
          floatingLabelText={formatMessage({ id: 'parking_number_of_spaces_with_recharge_point' })}
          onChange={(_e, value) => {
            handleSetNumberOfSpacesWithRechargePoint(value);
          }}
          value={numberOfSpacesWithRechargePoint}
          type="number"
          style={{ width: '95%', marginTop: -10 }} />
      </div>
    </div>
  );
}

export default injectIntl(ParkingItemPayAndRideExpandedFields);
