<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span class="font-weight-bold">I612</span>
      </v-toolbar-title>
      <v-btn
        class="overline blue-grey--text ml-2"
        :href="versionLink"
        target="_blank"
        text
        small
      >{{ version }}</v-btn>
      <v-spacer />
      <v-btn
        v-if="isShowUploadButton"
        :to="{ name: 'upload' }"
        large
        exact
        outlined
      >
        Upload
      </v-btn>
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
    versionLink() {
      return process.env.VUE_APP_VERSION ? (
        `https://github.com/likecoin/ipfs-viewer/commit/${process.env.VUE_APP_VERSION}`
      ) : '#';
    },
    isShowUploadButton() {
      return !/(home|upload)/.test(this.$route.name);
    },
  },
};
</script>
