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
        :class="{ paused: refreshPaused }"
        :title="refreshPaused ? 'Reanudar auto-refresh' : 'Pausar auto-refresh'"
        :aria-label="refreshPaused ? 'Reanudar auto-refresh' : 'Pausar auto-refresh'"
        @click="toggleRefresh"
      >
        <span class="spinner" aria-hidden="true"></span>
        <svg class="icon-pause" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
        <svg class="icon-play" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 2.5v11a1 1 0 0 0 1.5.87l9-5.5a1 1 0 0 0 0-1.74l-9-5.5A1 1 0 0 0 4 2.5z" />
        </svg>
      </button>
    </span>
  </div>
  <router-view/>
</template>

<script>
export default {
  computed: {
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
    align-items: center;
    margin-left: 20px;
    vertical-align: middle;

    .refresh-toggle {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      padding: 0;
      border: 1px solid #ccc;
      border-radius: 3px;
      background: #fff;
      color: #2c3e50;
      cursor: pointer;

      &:hover {
        color: #42b983;
        border-color: #42b983;
      }

      // Spinner: shown while auto-refresh is running.
      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid #ddd;
        border-top-color: #42b983;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .icon-pause,
      .icon-play {
        display: none;
        width: 14px;
        height: 14px;
        fill: currentColor;
      }

      // Running + hover: reveal the pause affordance.
      &:not(.paused):hover {
        .spinner { display: none; }
        .icon-pause { display: block; }
      }

      // Paused: show the play icon.
      &.paused {
        .spinner { display: none; }
        .icon-play { display: block; }
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
