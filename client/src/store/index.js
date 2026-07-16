import { createStore } from 'vuex';
import axios from 'axios';

const state = {
  queues: [],
  workers: [],
  failed: [],
  failedTotal: 0,
  resqueStats: {},
  redisStats: {},
  lastError: null,
  periodic: {},
  refreshPaused: localStorage.getItem('refreshPaused') === 'true',
};

const mutations = {
  setQueues(state, items) { state.queues = items },
  setWorkers(state, items) { state.workers = items },
  setFailed(state, items) { state.workers = items },
  setFailedTotal(state, count) { state.failedTotal = count },
  setStats(state, stats) {
    state.redisStats = stats.redis;
    state.resqueStats = delete(stats.redis) && stats;
  },
  setLastError(state, err) { state.lastError = err },
  incPeriodic(state, key) {
    if ( state.periodic[key] ) { state.periodic[key]++   }
    else                       { state.periodic[key] = 1 }
  },
  decPeriodic(state, key) {
    if ( state.periodic[key] ) { state.periodic[key]--   }
    else                       { state.periodic[key] = 0 }
  },
  setRefreshPaused(state, paused) {
    state.refreshPaused = paused;
    localStorage.setItem('refreshPaused', paused);
  },
};

const REFRESH_INTERVAL = 1500;

const tasks = { waiting: {} };

function clearTimer(action) {
  if ( tasks[action] ) {
    clearInterval(tasks[action]);
    delete tasks[action];
  }
}

function makeTimer(action, dispatch) {
  return setInterval( async () => {
    if ( tasks.waiting[action] ) return;
    tasks.waiting[action] = true;
    await dispatch(action);
    tasks.waiting[action] = false;
  }, REFRESH_INTERVAL );
}

function rebuildTimers(state, dispatch) {
  Object.keys(state.periodic).forEach( action => {
    if ( state.periodic[action] > 0 ) {
      clearTimer(action);
      if ( !state.refreshPaused ) {
        dispatch(action);
        tasks[action] = makeTimer(action, dispatch);
      }
    }
  });
}

const actions = {
  startPeriodic({ state, commit, dispatch }, action){
    commit('incPeriodic', action);
    if ( state.periodic[action] === 1 ) {
      dispatch(action);
      if ( !state.refreshPaused ) {
        tasks[action] = makeTimer(action, dispatch);
      }
    }
  },
  stopPeriodic({ state, commit }, action){
    commit('decPeriodic', action);
    if ( state.periodic[action] === 0 ) {
      clearTimer(action);
    }
  },
  setRefreshPaused({ state, commit, dispatch }, paused){
    commit('setRefreshPaused', paused);
    rebuildTimers(state, dispatch);
  },
  async fetchQueues({ commit }){
    try {
      const res = (await axios.get('/queues')).data;
      commit('setQueues', res.items);
      commit('setFailedTotal', res.failed);
    }
    catch(error) {
      console.log(error);
      commit('setLastError', { action: 'fetchQueues', error });
    }
  },
  async fetchWorkers({ commit }){
    try {
      const items = (await axios.get('/workers')).data;
      commit('setWorkers', items);
    }
    catch(error) {
      console.log(error);
      commit('setLastError', { action: 'fetchWorkers', error });
    }
  },
  async fetchFailed({ commit }){
    try {
      const res = (await axios.get('/failed')).data;
      commit('setFailed', res.items);
      commit('setFailedTotal', res.total);
    }
    catch(error) {
      console.log(error);
      commit('setLastError', { action: 'fetchFailed', error });
    }
  },
  async fetchStats({ commit }){
    try {
      const stats = (await axios.get('/stats')).data;
      commit('setStats', stats);
    }
    catch(error) {
      console.log(error);
      commit('setLastError', { action: 'fetchStats', error });
    }
  }
};

const getters = {
  activeQueues(state) {
    return state.queues.filter( queue => queue.jobs > 0 ).sort( (a, b) => a.name > b.name )
  },
  working(state) {
    return state.workers.filter(
      worker => worker.working.state !== 'idle'
    ).map(
      worker => {
        worker.working.run_at = worker.working.run_at + 'Z';
        worker.working.since = new Date(worker.working.run_at);
        return worker;
      }
    ).sort( (a, b) => a.working.since > b.working.since );
  },
  hosts(state) {
    const hosts = {};

    state.workers.forEach( worker => {
      const host = worker.id.replace(/:.*$/, '');
      if ( !hosts[host] ) hosts[host] = { name: host, workers: 0, working: 0, waiting: {} };

      hosts[host].workers++;

      if ( worker.working.state !== 'idle' ) { hosts[host].working++ }
      else {
        worker.queues.forEach( queue => hosts[host].waiting[queue] = (hosts[host].waiting[queue]||0) + 1 )
      }
    });

    return Object.values(hosts).sort( (a, b) => a.name > b.name );
  }
};

export default createStore({ state, mutations, actions, getters });
