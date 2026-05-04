// ===== firebase.js =====
// Firebase Realtime Database 接続・同期

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, set, get, onValue, update, push, remove, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9ncbemina3ur2F-e7vX07OtqiPEu0EmE",
  authDomain: "chinuquest-87b81.firebaseapp.com",
  databaseURL: "https://chinuquest-87b81-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chinuquest-87b81",
  storageBucket: "chinuquest-87b81.firebasestorage.app",
  messagingSenderId: "546856004041",
  appId: "1:546856004041:web:1bfc48e4d7d6418324a018"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// ===== 匿名ログイン =====
export function loginAnonymously() {
  return signInAnonymously(auth);
}

export function onAuthReady(cb) {
  return onAuthStateChanged(auth, cb);
}

// ===== ルーム操作 =====

// 4桁ルームコード生成
export function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ルーム作成（管理者）
export async function createRoom(roomCode, config) {
  await set(ref(db, `rooms/${roomCode}`), {
    config,
    status: 'waiting', // waiting / playing / finished
    turn: { uid: null, count: 0 },
    cells: initCells(),
    players: {},
    log: []
  });
}

// ルーム参加
export async function joinRoom(roomCode, uid, playerData) {
  await set(ref(db, `rooms/${roomCode}/players/${uid}`), playerData);
}

// ルーム存在確認
export async function roomExists(roomCode) {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  return snap.exists();
}

// ルーム情報取得（1回）
export async function getRoom(roomCode) {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  return snap.exists() ? snap.val() : null;
}

// ルームをリアルタイム監視
export function watchRoom(roomCode, cb) {
  return onValue(ref(db, `rooms/${roomCode}`), snap => {
    if (snap.exists()) cb(snap.val());
  });
}

// プレイヤー情報をリアルタイム監視
export function watchPlayers(roomCode, cb) {
  return onValue(ref(db, `rooms/${roomCode}/players`), snap => {
    cb(snap.exists() ? snap.val() : {});
  });
}

// ゲーム状態更新
export async function updateGameState(roomCode, updates) {
  await update(ref(db, `rooms/${roomCode}`), updates);
}

// プレイヤー状態更新
export async function updatePlayer(roomCode, uid, updates) {
  await update(ref(db, `rooms/${roomCode}/players/${uid}`), updates);
}

// マス状態更新
export async function updateCell(roomCode, cellId, updates) {
  await update(ref(db, `rooms/${roomCode}/cells/${cellId}`), updates);
}

// ターン更新
export async function updateTurn(roomCode, uid, count) {
  await update(ref(db, `rooms/${roomCode}/turn`), { uid, count });
}

// ログ追加
export async function addLog(roomCode, message) {
  await push(ref(db, `rooms/${roomCode}/log`), {
    msg: message,
    ts: Date.now()
  });
}

// ゲーム開始
export async function startGame(roomCode, firstPlayerUid) {
  await update(ref(db, `rooms/${roomCode}`), {
    status: 'playing',
    'turn/uid': firstPlayerUid,
    'turn/count': 1
  });
}

// ===== 18マス初期データ =====
function initCells() {
  const cells = {};
  for (let i = 0; i < 18; i++) {
    let type = 'empty';
    if (i === 0)  type = 'goal';
    else if (i === 9) type = 'cp';
    else if (i === 3 || i === 13) type = 'shop';
    cells[i] = {
      id: i,
      type,
      attr: 'none',
      owner: null,
      monster: null,
      monsterEquip: null,
      level: 1,
      name: { goal: 'ゴール', cp: 'CP', shop: 'ショップ' }[type] || `マス${i}`,
      investedCost: 0, // 投下資本（購入代+LvUP代）
      flags: {}        // モロ引っ掛け等の特殊フラグ
    };
  }
  return cells;
}
