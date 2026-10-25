import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  query,
  orderByChild,
} from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

// ─── USER HELPERS ───

export function getUserRef(uid) {
  return ref(db, `users/${uid}`);
}

export function listenToUser(uid, callback) {
  return onValue(ref(db, `users/${uid}`), (snapshot) => {
    callback(snapshot.val());
  });
}

export async function updateUserProfile(uid, data) {
  await update(ref(db, `users/${uid}`), data);
}

// ─── TEAM HELPERS ───

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export async function generateUniqueTeamCode() {
  let code;
  let exists = true;
  while (exists) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    const snapshot = await get(ref(db, `teamCodes/${code}`));
    exists = snapshot.exists();
  }
  return code;
}

export async function createTeam(uid, userName, userCollege, { teamName, track, idea }) {
  const code = await generateUniqueTeamCode();
  const teamRef = push(ref(db, 'teams'));
  const teamId = teamRef.key;
  const now = Date.now();

  const updates = {};
  updates[`teams/${teamId}`] = {
    name: teamName,
    code,
    track: track || '',
    idea: idea || '',
    leaderUid: uid,
    memberCount: 1,
    createdAt: now,
  };
  updates[`teams/${teamId}/members/${uid}`] = {
    name: userName,
    college: userCollege || '',
    joinedAt: now,
  };
  updates[`teamCodes/${code}`] = teamId;
  updates[`users/${uid}/teamId`] = teamId;

  await update(ref(db), updates);
  return { teamId, code };
}

export async function joinTeam(uid, userName, userCollege, teamCode, maxTeamSize = 4) {
  const codeSnapshot = await get(ref(db, `teamCodes/${teamCode}`));
  if (!codeSnapshot.exists()) {
    throw new Error('Invalid team code. Please check and try again.');
  }

  const teamId = codeSnapshot.val();
  const teamSnapshot = await get(ref(db, `teams/${teamId}`));
  if (!teamSnapshot.exists()) {
    throw new Error('Team not found.');
  }

  const team = teamSnapshot.val();
  const currentMembers = team.members ? Object.keys(team.members).length : 0;
  if (currentMembers >= maxTeamSize) {
    throw new Error(`Team is full (max ${maxTeamSize} members).`);
  }

  const now = Date.now();
  const updates = {};
  updates[`teams/${teamId}/members/${uid}`] = {
    name: userName,
    college: userCollege || '',
    joinedAt: now,
  };
  updates[`teams/${teamId}/memberCount`] = currentMembers + 1;
  updates[`users/${uid}/teamId`] = teamId;

  await update(ref(db), updates);
  return teamId;
}

export async function leaveTeam(uid, teamId) {
  const updates = {};
  updates[`teams/${teamId}/members/${uid}`] = null;
  updates[`users/${uid}/teamId`] = null;

  const snapshot = await get(ref(db, `teams/${teamId}/memberCount`));
  const current = snapshot.val() || 1;
  updates[`teams/${teamId}/memberCount`] = Math.max(0, current - 1);

  await update(ref(db), updates);
}

export async function removeTeamMember(leaderUid, teamId, memberUid) {
  const teamSnapshot = await get(ref(db, `teams/${teamId}`));
  if (!teamSnapshot.exists()) throw new Error('Team not found');
  const team = teamSnapshot.val();
  if (team.leaderUid !== leaderUid) throw new Error('Only the team leader can remove members');

  const updates = {};
  updates[`teams/${teamId}/members/${memberUid}`] = null;
  updates[`users/${memberUid}/teamId`] = null;

  const current = team.memberCount || Object.keys(team.members || {}).length;
  updates[`teams/${teamId}/memberCount`] = Math.max(0, current - 1);

  await update(ref(db), updates);
}

export async function removeMember(leaderUid, teamId, memberUid) {
  return removeTeamMember(leaderUid, teamId, memberUid);
}

export async function disbandTeam(leaderUid, teamId) {
  const teamSnapshot = await get(ref(db, `teams/${teamId}`));
  if (!teamSnapshot.exists()) throw new Error('Team not found');
  const team = teamSnapshot.val();
  if (team.leaderUid !== leaderUid) throw new Error('Only the team leader can disband the team');

  const updates = {};
  updates[`teams/${teamId}`] = null;
  updates[`teamCodes/${team.code}`] = null;

  if (team.members) {
    for (const memberUid of Object.keys(team.members)) {
      updates[`users/${memberUid}/teamId`] = null;
    }
  }

  await update(ref(db), updates);
}

export function listenToTeam(teamId, callback) {
  if (!teamId) return () => {};
  return onValue(ref(db, `teams/${teamId}`), (snapshot) => {
    callback(snapshot.val());
  });
}

// ─── ANNOUNCEMENTS ───

export function listenToAnnouncements(callback) {
  const q = query(ref(db, 'announcements'), orderByChild('createdAt'));
  return onValue(q, (snapshot) => {
    const data = [];
    snapshot.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
    callback(data.reverse());
  });
}

export async function createAnnouncement({ title, body, priority, pinned, uid, authorName }) {
  const newRef = push(ref(db, 'announcements'));
  await set(newRef, {
    title,
    body,
    priority: priority || 'normal',
    pinned: pinned || false,
    createdAt: Date.now(),
    createdBy: uid,
    authorName: authorName || '',
  });
  return newRef.key;
}

export async function updateAnnouncement(id, data) {
  await update(ref(db, `announcements/${id}`), data);
}

export async function deleteAnnouncement(id) {
  await remove(ref(db, `announcements/${id}`));
}

// ─── ROUNDS ───

export function listenToRounds(callback) {
  const q = query(ref(db, 'rounds'), orderByChild('order'));
  return onValue(q, (snapshot) => {
    const data = [];
    snapshot.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
    callback(data);
  });
}

export async function createRound(data) {
  const newRef = push(ref(db, 'rounds'));
  await set(newRef, data);
  return newRef.key;
}

export async function updateRound(id, data) {
  await update(ref(db, `rounds/${id}`), data);
}

export async function deleteRound(id) {
  await remove(ref(db, `rounds/${id}`));
}

// ─── SUBMISSIONS ───

export function listenToSubmission(roundId, teamId, callback) {
  if (!roundId || !teamId) return () => {};
  return onValue(ref(db, `submissions/${roundId}/${teamId}`), (snapshot) => {
    callback(snapshot.val());
  });
}

export function listenToAllSubmissionsForRound(roundId, callback) {
  return onValue(ref(db, `submissions/${roundId}`), (snapshot) => {
    const data = [];
    snapshot.forEach((child) => {
      data.push({ teamId: child.key, ...child.val() });
    });
    callback(data);
  });
}

export async function submitForRound(roundId, teamId, uid, data, file, onProgress) {
  const now = Date.now();
  let fileUrl = data.fileUrl || '';
  let fileName = data.fileName || '';

  if (file) {
    const filePath = `submissions/${teamId}/${roundId}/${file.name}`;
    const sRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(sRef, file);

    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snap) => {
          const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        reject,
        async () => {
          fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          fileName = file.name;
          resolve();
        }
      );
    });
  }

  const submissionData = {
    title: data.title || '',
    description: data.description || '',
    fileUrl,
    fileName,
    githubUrl: data.githubUrl || '',
    demoUrl: data.demoUrl || '',
    submittedBy: uid,
    submittedAt: now,
    updatedAt: now,
    status: 'submitted',
    score: null,
    feedback: '',
  };

  await set(ref(db, `submissions/${roundId}/${teamId}`), submissionData);
  return submissionData;
}

export async function updateSubmissionStatus(roundId, teamId, status, feedback, score) {
  await update(ref(db, `submissions/${roundId}/${teamId}`), {
    status,
    feedback: feedback || '',
    score: score || null,
    updatedAt: Date.now(),
  });
}

// ─── HELP SESSIONS ───

export function listenToHelpSessions(callback) {
  return onValue(ref(db, 'helpSessions'), (snapshot) => {
    const data = [];
    snapshot.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
    callback(data);
  });
}

export async function createHelpSession(data) {
  const newRef = push(ref(db, 'helpSessions'));
  await set(newRef, data);
  return newRef.key;
}

export async function updateHelpSession(id, data) {
  await update(ref(db, `helpSessions/${id}`), data);
}

export async function deleteHelpSession(id) {
  await remove(ref(db, `helpSessions/${id}`));
}

// ─── HELP REQUESTS ───

export function listenToHelpRequests(uid, isAdmin, callback) {
  const requestsRef = ref(db, 'helpRequests');
  return onValue(requestsRef, (snapshot) => {
    const data = [];
    snapshot.forEach((child) => {
      const val = child.val();
      if (isAdmin || val.uid === uid) {
        data.push({ id: child.key, ...val });
      }
    });
    callback(data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  });
}

export async function createHelpRequest({ uid, teamId, subject, category, message }) {
  const newRef = push(ref(db, 'helpRequests'));
  await set(newRef, {
    uid,
    teamId: teamId || '',
    subject,
    category,
    message,
    status: 'open',
    createdAt: Date.now(),
  });
  return newRef.key;
}

export async function updateHelpRequestStatus(id, status) {
  await update(ref(db, `helpRequests/${id}`), { status });
}

export async function addHelpReply(requestId, uid, text) {
  const replyRef = push(ref(db, `helpRequests/${requestId}/replies`));
  await set(replyRef, {
    by: uid,
    text,
    at: Date.now(),
  });
}

// ─── SETTINGS ───

export function listenToSettings(callback) {
  return onValue(ref(db, 'settings'), (snapshot) => {
    callback(snapshot.val());
  });
}

export async function updateSettings(path, data) {
  await update(ref(db, `settings/${path}`), data);
}

export async function setSettings(path, data) {
  await set(ref(db, `settings/${path}`), data);
}

// ─── STATS ───

export function listenToStats(callback) {
  const unsubs = [];

  const usersUnsub = onValue(ref(db, 'users'), (snapshot) => {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    callback((prev) => ({ ...prev, participants: count }));
  });
  unsubs.push(usersUnsub);

  const teamsUnsub = onValue(ref(db, 'teams'), (snapshot) => {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    callback((prev) => ({ ...prev, teams: count }));
  });
  unsubs.push(teamsUnsub);

  const subsUnsub = onValue(ref(db, 'submissions'), (snapshot) => {
    let count = 0;
    if (snapshot.exists()) {
      snapshot.forEach((round) => {
        count += Object.keys(round.val()).length;
      });
    }
    callback((prev) => ({ ...prev, submissions: count }));
  });
  unsubs.push(subsUnsub);

  return () => unsubs.forEach((u) => u());
}

// ─── GENERIC LISTENER ───

export function listenToPath(path, callback) {
  return onValue(ref(db, path), (snapshot) => {
    callback(snapshot.val());
  });
}

// ─── TEAM CODE LOOKUP ───

export async function lookupTeamByCode(code) {
  const snapshot = await get(ref(db, `teamCodes/${code}`));
  if (!snapshot.exists()) return null;
  const teamId = snapshot.val();
  const teamSnapshot = await get(ref(db, `teams/${teamId}`));
  if (!teamSnapshot.exists()) return null;
  return { teamId, ...teamSnapshot.val() };
}
