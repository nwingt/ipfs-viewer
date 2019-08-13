<template>
  <v-container class="view-page py-8">
    <v-card
      class="mx-auto"
      flat
      outlined
    >
      <div class="v-sheet image-wrapper">
        <img
          v-if="imageSource"
          :src="imageSource"
        >
      </div>
      <v-flex text-right>
        <v-btn
          v-if="isSupportShare"
          @click="onShare"
          justify="end"
          icon
        >
          <v-icon>mdi-share</v-icon>
        </v-btn>
      </v-flex>
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

      img {
        display: block;

        max-width: 100%;
        margin: 0 auto;
      }
    }

  }
}
</style>
