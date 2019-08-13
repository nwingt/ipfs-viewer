<template>
  <v-container class="view-page py-8">
    <v-card
      class="mx-auto"
      flat
      outlined
    >
      <div class="image-wrapper">
        <img
          v-if="imageSource"
          :src="imageSource"
        >
      </div>
      <v-toolbar flat>
        <v-toolbar-title>ISCN Properties</v-toolbar-title>
        <v-spacer />
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              color="blue darken-2"
              icon
            >
              <v-icon v-if="fab">mdi-close</v-icon>
              <v-icon v-else>mdi-open-in-new</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in ipfsGateways"
              :key="index"
              :href="`${item.link}/${ipfsHash}`"
              target="_blank"
            >
              <v-list-item-title>View via {{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          v-if="isSupportShare"
          icon
          @click="onShare"
        >
          <v-icon>mdi-share</v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider />
      <v-list>
        <v-list-item
          v-for="key in Object.keys(filtered)"
          :key="key"
          two-line
        >
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">{{ key }}</v-list-item-title>
            <v-list-item-subtitle>
              <code>
                <template v-if="key === 'txHash'">
                  <a :href="txHashUrl" target="blank">{{ filtered[key] }}</a>
                </template>
                <template v-else-if="key === '@id'">
                  <a :href="imageSource" target="blank">{{ filtered[key] }}</a>
                </template>
                <template v-else>{{ filtered[key] }}</template>
              </code>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';
import Web3 from 'web3';
import { abi, address } from '../constant/contract';

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/66d5ee46e5a14aa387c9e4fbc662727f'));
const Storage = new web3.eth.Contract(abi, address);

export default {
  data() {
    return {
      ipfsGateways: [
        { title: 'ipfs.io', link: 'https://ipfs.io/ipfs' },
        { title: 'Cloudflare', link: 'http://cloudflare-ipfs.com/ipfs' },
        { title: 'Infura', link: 'http://ipfs.infura.io/ipfs' },
      ],
      fab: false,
      metadata: {},
      txHash: '',
      ipfsHash: '',
      txTimeStamp: 0,
    };
  },
  computed: {
    isSupportShare() {
      return !!window.navigator.share;
    },
    hash() {
      return this.$route.params.hash;
    },
    txHashUrl() {
      if (this.txHash) return `https://etherscan.io/tx/${this.txHash}`;
      return `https://etherscan.io/address/${address}`;
    },
    imageSource() {
      return `https://ipfs.infura.io/ipfs/${this.ipfsHash}`;
    },
    filtered() {
      return {
        txHash: this.txHash ? this.txHash : 'pending or not found',
        blockTime: this.txTimeStamp ? new Date(this.txTimeStamp) : 'pending or not found',
        ...this.metadata,
      };
    },
  },
  async mounted() {
    if (this.hash) {
      const { data: ipldData } = await axios.get(`https://ipfs.infura.io:5001/api/v0/dag/get?arg=${this.hash}`);
      if (ipldData['@id']) {
        this.ipfsHash = ipldData['@id'].replace('ipfs://', '');
        this.metadata = ipldData;
      } else {
        this.ipfsHash = this.hash;
      }
      const id = web3.utils.sha3(this.hash);
      const events = await Storage.getPastEvents('Data', {
        fromBlock: 8340000,
        filter: { id },
      });
      const event = events.find(e => e.returnValues.data === this.hash);
      if (event) {
        this.txHash = event.transactionHash;
        this.txTimeStamp = Number.parseInt(event.returnValues.timestamp, 10) * 1000;
      } else {
        this.txHash = '';
      }
    }
  },
  methods: {
    onShare() {
      if (window.navigator.share) {
        window.navigator.share({
          title: `${this.metadata.description || 'Image'} shared via i612`,
          url: window.location.href,
        });
      }
    },
  },
};
</script>

<style lang="scss">
.view-page {
  .v-card {
    max-width: 768px;

    .image-wrapper {
      background: #e0e0e0;

      border-top-left-radius: inherit;
      border-top-right-radius: inherit;

      overflow: hidden;

      img {
        display: block;

        max-width: 100%;
        margin: 0 auto;
      }
    }

  }
}
</style>
