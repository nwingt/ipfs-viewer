<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>
        <v-img class="mt-2" src="./assets/logo.svg" max-width="80" contain />
        <div class="caption font-weight-light blue-grey--text text--darken-3">
          Lennon Wall on blockchain
        </div>
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="isShowUploadButton"
        class="mr-1"
        :to="{ name: 'upload' }"
        :large="isShowLargeUploadButton"
        :outlined="isShowLargeUploadButton"
        :icon="!isShowLargeUploadButton"
        exact
      >
        <template v-if="isShowLargeUploadButton">Upload</template>
        <v-icon v-else>mdi-upload</v-icon>
      </v-btn>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon>
            <v-icon>mdi-help-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in infoLinks"
            :key="index"
            :href="item.link"
            target="_blank"
          >
            <v-list-item-title>What is {{ item.title }}?</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <router-view/>
    </v-content>

    <v-footer>
      <v-spacer />
      <v-btn
        class="overline blue-grey--text ml-2"
        :href="versionLink"
        target="_blank"
        text
        small
      >{{ version }}</v-btn>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      infoLinks: [
        { title: 'Ethereum', link: 'https://consensys.net/knowledge-base/about-ethereum-eth/' },
        { title: 'dApp', link: 'https://www.coindesk.com/information/what-is-a-decentralized-application-dapp' },
        { title: 'IPFS', link: 'https://docs.ipfs.io/introduction/overview/' },
        { title: 'IPLD', link: 'https://ipld.io/' },
      ],
    };
  },
  computed: {
    version() {
      return (process.env.VUE_APP_VERSION || 'DEV').substr(0, 7);
    },
    versionLink() {
      return process.env.VUE_APP_VERSION ? (
        `https://github.com/likecoin/ipfs-viewer/tree/${process.env.VUE_APP_VERSION}`
      ) : '#';
    },
    isShowUploadButton() {
      return !/(home|upload)/.test(this.$route.name);
    },
    isShowLargeUploadButton() {
      return this.$vuetify.breakpoint.name !== 'xs';
    },
  },
};
</script>
