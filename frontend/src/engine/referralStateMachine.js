export const REFERRAL_STATES = {
  CREATED: 'created',
  NOTIFIED: 'notified',
  CONFIRMED: 'confirmed',
  IN_CONSULTATION: 'in_consultation',
  COMPLETED: 'completed',
  FOLLOW_UP_SCHEDULED: 'follow_up_scheduled',
  CLOSED: 'closed',
  MISSED: 'missed',
  ASHA_REENGAGEMENT: 'asha_reengagement',
  WRONG_DESTINATION: 'wrong_destination',
  RE_ROUTED: 're_routed',
};

const ALLOWED_TRANSITIONS = {
  [REFERRAL_STATES.CREATED]: [REFERRAL_STATES.NOTIFIED, REFERRAL_STATES.CONFIRMED, REFERRAL_STATES.RE_ROUTED, REFERRAL_STATES.MISSED],
  [REFERRAL_STATES.NOTIFIED]: [REFERRAL_STATES.CONFIRMED, REFERRAL_STATES.RE_ROUTED, REFERRAL_STATES.MISSED],
  [REFERRAL_STATES.CONFIRMED]: [REFERRAL_STATES.IN_CONSULTATION, REFERRAL_STATES.COMPLETED, REFERRAL_STATES.WRONG_DESTINATION, REFERRAL_STATES.RE_ROUTED, REFERRAL_STATES.MISSED],
  [REFERRAL_STATES.IN_CONSULTATION]: [REFERRAL_STATES.COMPLETED, REFERRAL_STATES.RE_ROUTED],
  [REFERRAL_STATES.COMPLETED]: [REFERRAL_STATES.FOLLOW_UP_SCHEDULED, REFERRAL_STATES.CLOSED],
  [REFERRAL_STATES.FOLLOW_UP_SCHEDULED]: [REFERRAL_STATES.CLOSED],
  [REFERRAL_STATES.WRONG_DESTINATION]: [REFERRAL_STATES.RE_ROUTED],
  [REFERRAL_STATES.RE_ROUTED]: [REFERRAL_STATES.CONFIRMED, REFERRAL_STATES.IN_CONSULTATION, REFERRAL_STATES.COMPLETED],
  [REFERRAL_STATES.MISSED]: [REFERRAL_STATES.ASHA_REENGAGEMENT],
  [REFERRAL_STATES.ASHA_REENGAGEMENT]: [REFERRAL_STATES.CONFIRMED, REFERRAL_STATES.CREATED],
  [REFERRAL_STATES.CLOSED]: [], // Terminal state
};

export function isValidReferralTransition(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true; // Idempotent
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

export function validateReferralTransition(currentStatus, targetStatus) {
  if (!isValidReferralTransition(currentStatus, targetStatus)) {
    throw new Error(`Invalid referral state transition from '${currentStatus}' to '${targetStatus}'. Transition rejected by CareLink Referral Engine.`);
  }
  return true;
}
