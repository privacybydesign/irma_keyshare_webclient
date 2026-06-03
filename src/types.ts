import type { Dispatch } from 'redux';

// ── Yivi session config ──────────────────────────────────────────────────────

export interface YiviSessionConfig {
  url: string;
  start: {
    url: (o: { url: string }) => string;
    method: 'POST';
    credentials: 'include';
  };
  result: false;
}

// ── Login slice ──────────────────────────────────────────────────────────────

export type SessionState =
  | 'unknown'
  | 'waitSendEmail'
  | 'waitVerifyEmail'
  | 'showPostRegistration'
  | 'emailSent'
  | 'waitCandidates'
  | 'selectCandidate'
  | 'loggedIn'
  | 'loggingOut'
  | 'loggedOut'
  | 'tokenInvalid'
  | 'warningRaised';

export interface Candidate {
  username: string;
  last_active: number;
}

export interface LoginState {
  sessionState: SessionState;
  candidates: Candidate[];
  error: string;
  token?: string;
  yiviSession?: YiviSessionConfig;
  explanation?: string;
  details?: string;
}

// ── Logs slice ───────────────────────────────────────────────────────────────

export interface LogEntry {
  timestamp: number;
  event: string;
  param?: string;
}

export interface LogsState {
  logEntries: LogEntry[];
  currentIndex: number;
  haveMore: boolean;
  loading: boolean;
}

// ── Userdata slice ───────────────────────────────────────────────────────────

export interface EmailRecord {
  email: string;
  delete_in_progress: boolean;
  revalidate_in_progress: boolean;
}

export interface UserDataResponse {
  username: string;
  emails: EmailRecord[];
  delete_in_progress: boolean;
  revalidate_in_progress: boolean;
}

export interface UserdataState {
  username: string;
  emails: EmailRecord[];
  deleting: boolean;
  fetching: boolean;
  revalidating?: boolean;
  addEmailYiviSession: YiviSessionConfig;
}

// ── Root state ───────────────────────────────────────────────────────────────

export interface RootState {
  login: LoginState;
  logs: LogsState;
  userdata: UserdataState;
}

// ── Action union ─────────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'startSendMail' }
  | { type: 'startRegistrationVerify'; token: string }
  | { type: 'registrationVerified' }
  | { type: 'emailSent' }
  | { type: 'startTokenLogin'; token: string }
  | { type: 'setCandidates'; candidates: Candidate[]; token: string }
  | { type: 'finishTokenLogin'; token: string; username: string }
  | { type: 'loggedIn' }
  | { type: 'logout' }
  | { type: 'loggedOut' }
  | { type: 'tokenInvalid' }
  | { type: 'raiseWarning'; explanation: string; details: string }
  | { type: 'raiseError'; errorMessage: string }
  | { type: 'resolveError' }
  | { type: 'loadLogs'; index: number }
  | { type: 'loadedLogs'; entries: LogEntry[] }
  | { type: 'errorLoadingLogs' }
  | { type: 'startUpdateInfo' }
  | { type: 'errorUpdateInfo' }
  | { type: 'updateInfo'; data: UserDataResponse }
  | { type: 'removeEmail'; email: string }
  | { type: 'emailRemoved' }
  | { type: 'removeAccount' }
  | { type: 'verifySession' }
  | { type: 'startEmailLogin'; email: string };

export type AppDispatch = Dispatch<AppAction>;
