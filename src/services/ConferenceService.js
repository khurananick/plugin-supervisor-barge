import { Manager } from '@twilio/flex-ui';

class ConferenceService {
  constructor() {
    const manager = Manager.getInstance();
    this.serviceBaseUrl = '<<SERVERLESS_DOMAIN_HERE>>';
  }

  // Private functions
  _getUserToken = () => {
    const manager = Manager.getInstance();
    return manager.user.token;
  }

  _toggleParticipantHold = (conference, participantSid, hold) => {
    return new Promise((resolve, reject) => {
      const token = this._getUserToken();

      return fetch(`https://${this.serviceBaseUrl}/hold-conference-participant`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: (
          `token=${token}`
          + `&conference=${conference}`
          + `&participant=${participantSid}`
          + `&hold=${hold}`
        )
      })
        .then(() => {
          console.log(`${hold ? 'Hold' : 'Unhold'} successful for participant`, participantSid);
          resolve();
        })
        .catch(error => {
          console.error(`Error ${hold ? 'holding' : 'unholding'} participant ${participantSid}\r\n`, error);
          reject(error);
        });
    });
  }

  _toggleParticipantCoach = (conference, participantSid, coaching, callSidToCoach) => {
    return new Promise((resolve, reject) => {
      const token = this._getUserToken();

      console.log(`${coaching ? 'Coaching' : 'Not Coaching'} participant`, participantSid);
      return fetch(`https://${this.serviceBaseUrl}/update-conference-participant`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: (
          `token=${token}`
          + `&conference=${conference}`
          + `&participant=${participantSid}`
          + `&muted=${!coaching}`
          + `&coaching=${coaching}`
          + `&callSidToCoach=${callSidToCoach}`
        )
      })
        .then(() => {
          console.log(`${coaching ? 'Coaching' : 'Not Coaching'} successful for participant`, participantSid);
          resolve();
        })
        .catch(error => {
          console.error(`Error ${coaching ? 'coaching' : 'not coaching'} participant ${participantSid}\r\n`, error);
          reject(error);
        });
    });
  }

  _toggleParticipantMute = (conference, participantSid, muted) => {
    return new Promise((resolve, reject) => {
      const token = this._getUserToken();

      console.log(`${muted ? 'Muting' : 'Unmuting'} participant`, participantSid);
      return fetch(`https://${this.serviceBaseUrl}/update-conference-participant`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: (
          `token=${token}`
          + `&conference=${conference}`
          + `&participant=${participantSid}`
          + `&muted=${muted}`
        )
      })
        .then(() => {
          console.log(`${muted ? 'Mute' : 'Unmute'} successful for participant`, participantSid);
          resolve();
        })
        .catch(error => {
          console.error(`Error ${muted ? 'muting' : 'unmuting'} participant ${participantSid}\r\n`, error);
          reject(error);
        });
    });
  }

  // Public functions
  getConferenceParticipants = (conference) => {
    return new Promise((resolve, reject) => {
      const token = this._getUserToken();

      fetch(`https://${this.serviceBaseUrl}/get-conference-participants`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: (
          `token=${token}`
          + `&conference=${conference}`
        )
      })
        .then(response => response.json())
        .then(json => {
          if (json && json.status === 200) {
            console.log(`Participants response:\r\n`, json);
            resolve(json.participants);
          }
        })
        .catch(error => {
          console.error(`Error getting participants\r\n`, error);
          reject(error);
        });
    });
  }

  setEndConferenceOnExit = (conference, participantSid, endConferenceOnExit) => {
    return new Promise((resolve, reject) => {
      const token = this._getUserToken();

      fetch(`https://${this.serviceBaseUrl}/update-conference-participant`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: (
          `token=${token}`
          + `&conference=${conference}`
          + `&participant=${participantSid}`
          + `&endConferenceOnExit=${endConferenceOnExit}`
        )
      })
        .then(response => response.json())
        .then(json => {
          if (json && json.status === 200) {
            console.log(`Participant ${participantSid} updated:\r\n`, json);
            resolve();
          }
        })
        .catch(error => {
          console.error(`Error updating participant ${participantSid}\r\n`, error);
          reject(error);
        });
    });
  }

  addParticipant = (taskSid, from, to) => {
    return new Promise((resolve, reject) => {
      const token = this._getUserToken();

      fetch(`https://${this.serviceBaseUrl}/add-conference-participant`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: `token=${token}&taskSid=${taskSid}&from=${from}&to=${to}`
      })
        .then(response => response.json())
        .then(json => {
          if (json.status === 200) {
            console.log('Participant added:\r\n  ', json);
            resolve();
          }
        })
        .catch(error => {
          console.error(`Error adding participant ${to}\r\n`, error);
          reject(error);
        });
    });
  }

  holdParticipant = (conference, participantSid) => {
    return this._toggleParticipantHold(conference, participantSid, true);
  }

  unholdParticipant = (conference, participantSid) => {
    return this._toggleParticipantHold(conference, participantSid, false);
  }

  muteParticipant = (conference, participantSid) => {
    return this._toggleParticipantMute(conference, participantSid, true);
  }

  unmuteParticipant = (conference, participantSid) => {
    return this._toggleParticipantMute(conference, participantSid, false);
  }

  coachParticipant = (conference, participantSid, callSidToCoach) => {
    return this._toggleParticipantCoach(conference, participantSid, true, callSidToCoach);
  }

  notCoachParticipant = (conference, participantSid) => {
    return this._toggleParticipantCoach(conference, participantSid, false, '');
  }

  removeParticipant = (conference, participantSid) => {
    return new Promise((resolve, reject) => {
      const token = this._getUserToken();

      fetch(`https://${this.serviceBaseUrl}/remove-conference-participant`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: (
          `token=${token}`
          + `&conference=${conference}`
          + `&participant=${participantSid}`
        )
      })
        .then(() => {
          console.log(`Participant ${participantSid} removed from conference`);
          resolve();
        })
        .catch(error => {
          console.error(`Error removing participant ${participantSid} from conference\r\n`, error);
          reject(error);
        });
    });
  }
}

const conferenceService = new ConferenceService();

export default conferenceService;
