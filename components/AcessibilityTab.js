import React from 'react'
import Checkbox from 'material-ui/Checkbox'
import WheelChairOff from 'material-ui/svg-icons/action/accessibility'
import WheelChair from 'material-ui/svg-icons/action/accessible'
import Stairs from '../static/icons/accessibility/Stairs'
import StepFree from '../static/icons/accessibility/StepFree'
import MdHelp from 'material-ui/svg-icons/action/help'
import Divider from 'material-ui/Divider'

class AcessibilityTab extends React.Component {

  render() {

    const { formatMessage } = this.props.intl

    return (
      <div style={{padding: 10}}>
        <div style={{marginTop: 10}}>
          <div style={{display: 'flex',justifyContent: 'space-between'}}>
            <Checkbox
              checkedIcon={<WheelChair />}
              uncheckedIcon={<WheelChairOff />}
              label={formatMessage({id: 'wheelchairAccess'})}
              labelStyle={{fontSize: '0.8em'}}
              style={{width: '45%'}}
            />
            <MdHelp color="orange"/>
          </div>
          <Divider style={{marginTop: 10, marginBottom: 10}}/>
        </div>
       <div style={{marginTop: 10}}>
         <div style={{display: 'flex',justifyContent: 'space-between'}}>
           <Checkbox
             checkedIcon={<StepFree />}
             uncheckedIcon={<Stairs />}
             label={formatMessage({id: 'step_free_access'})}
             labelStyle={{fontSize: '0.8em'}}
             style={{width: '45%'}}
           />
           <MdHelp color="orange"/>
         </div>
         <Divider style={{marginTop: 10, marginBottom: 10}}/>
       </div>
      </div>
    )
  }
}

export default AcessibilityTab