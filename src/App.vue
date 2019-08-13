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
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            class="mx-4"
            icon
          >
            <v-icon>mdi-help</v-icon>
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
  },
};
</script>
