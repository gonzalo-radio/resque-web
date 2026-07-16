<template>
  <div id="nav">
    <router-link to="/">Overview</router-link>
    <router-link to="/working">Working</router-link>
    <router-link to="/failed">Failed</router-link>
    <router-link to="/queues">Queues</router-link>
    <router-link to="/workers">Workers</router-link>
    <router-link to="/stats">Stats</router-link>
    <span id="refresh-control">
      <button
        type="button"
        class="refresh-toggle"
        :title="refreshPaused ? 'Reanudar auto-refresh' : 'Pausar auto-refresh'"
        @click="toggleRefresh"
      >{{ refreshPaused ? '▶' : '⏸' }}</button>
      <select v-model.number="refreshInterval" :disabled="refreshPaused" aria-label="Frecuencia de refresco">
        <option :value="1000">1s</option>
        <option :value="2000">2s</option>
        <option :value="5000">5s</option>
        <option :value="10000">10s</option>
        <option :value="30000">30s</option>
      </select>
    </span>
  </div>
  <router-view/>
</template>

<script>
export default {
  computed: {
    refreshInterval: {
      get() { return this.$store.state.refreshInterval; },
      set(ms) { this.$store.dispatch('setRefreshInterval', Number(ms)); }
    },
    refreshPaused() { return this.$store.state.refreshPaused; }
  },
  methods: {
    toggleRefresh() {
      this.$store.dispatch('setRefreshPaused', !this.refreshPaused);
    }
  }
};
</script>

<style lang="scss">
body {
  margin:0;
  padding:0;
  background-color:#fafafa;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 0 0 30px 0;
}

a {
  text-decoration: none;
  color: #2c3e50;
  &:hover {
    color: #42b983;
    text-decoration: underline;
  }
}

#nav {
  text-align: center;
  padding: 30px 0;
  background-color:#fff;
  border-bottom: 1px solid #efefef;

  a {
    padding: 20px;
    font-weight: bold;

    &.router-link-exact-active {
      color: #42b983;
    }
  }

  #refresh-control {
    display: inline-flex;
    align-items: stretch;
    gap: 8px;
    margin-left: 20px;
    vertical-align: middle;

    .refresh-toggle,
    select {
      box-sizing: border-box;
      height: 30px;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 0 10px;
      font-size: 13px;
      color: #2c3e50;
      background: #fff;
    }

    .refresh-toggle {
      cursor: pointer;
      line-height: 1;

      &:hover {
        color: #42b983;
        border-color: #42b983;
      }
    }

    select {
      padding: 0 6px;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

div.widget {
  width:80%;
  margin: 30px auto 0 auto;
  padding: 15px 30px;
  background-color: #fefefe;
  border-radius: 2px;

  h1 {
    margin:0;
  }

  p {
    font-size: 12px;
    color: #bababa;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
    width:100%;

    td, th {
      border: 1px solid #ccc;
      padding: 6px;
    }

    th {
      background: #efefef;
      color: #888;
      font-size: 15px;
      font-weight: bold;
      text-align: left;
    }

    tr:hover {
      background-color: #fafafa;
    }
  }
}
</style>
