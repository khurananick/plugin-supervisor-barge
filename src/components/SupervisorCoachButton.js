import * as React from 'react';
import { Actions, IconButton, TaskHelper, withTheme } from '@twilio/flex-ui';
import styled from 'react-emotion';
import ConferenceService from '../services/ConferenceService';

const ButtonContainer = styled('div')`
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
`;

const buttonStyle = {
  width: '44px',
  height: '44px',
  'margin-left': '6px',
  'margin-right': '6px',
}

class SupervisorCoachButton extends React.Component {
  state = {
    supervisorCallSid: '',
    icon: 'GenericTask',
    coaching: false,
    callSidToCoach: ''
  }

  componentDidMount() {
    Actions.addListener('afterMonitorCall', (payload) => {
      const { task } = payload;
      const conference = task && task.conference;
      const conferenceSid = conference && conference.conferenceSid;
      this.getSupervisorCallSid(conferenceSid);
    });
  }

  getSupervisorCallSid = async (conferenceSid) => {
    try {
      const participants = await ConferenceService.getConferenceParticipants(conferenceSid);
      let supervisorParticipant = participants.filter(p => p.muted === true);
      if (supervisorParticipant.length > 0) {
        supervisorParticipant = supervisorParticipant[0];
      }
      const supervisorCallSid = supervisorParticipant && supervisorParticipant.callSid;
      this.setState({ supervisorCallSid });
    } catch (error) {
      console.error('Error in getSupervisorCallSid\r\n', error);
    }
  }

  handleClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSid = conference && conference.conferenceSid;
    const { supervisorCallSid, coaching } = this.state;

    let callSidToCoach;
    for(const p of conference.participants)
      if(!callSidToCoach)
        if(p.uniqueId.match(/^WK/))
          callSidToCoach = p.callSid

    if (!coaching) {
      ConferenceService.coachParticipant(conferenceSid, supervisorCallSid, callSidToCoach);
      this.setState({ coaching: true, callSidToCoach: callSidToCoach, icon: 'GenericTaskBold' });
    } else {
      ConferenceService.notCoachParticipant(conferenceSid, supervisorCallSid);
      this.setState({ coaching: false, callSidToCoach: '', icon: 'GenericTask' });
    }
  }

  render() {
    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={this.state.icon}
          disabled={!isLiveCall}
          onClick={this.handleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title="Barge into conference"
          style={buttonStyle}
        />
      </ButtonContainer>
    )
  }
}

export default withTheme(SupervisorCoachButton);
