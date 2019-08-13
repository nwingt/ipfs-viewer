<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span class="font-weight-bold">I612</span>
        &nbsp;<span class="overline">{{ version }}</span>
      </v-toolbar-title>
    </v-app-bar>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data: () => ({
    //
  }),
  computed: {
    version() {
      return (process.env.VUE_APP_VERSION || 'DEV').substr(0, 7);
    },
  },
};
</script>
