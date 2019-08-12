<template>
  <v-container class="about">
    <v-img
      v-if="imageSource"
      :src="imageSource"
    ></v-img>
    <v-simple-table>
      <tbody>
        <tr
          v-for="key in Object.keys(filtered)"
          :key="key"
        >
          <td>{{ key }}</td>
          <td>{{ filtered[key] }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-container>
</template>

<script>
import axios from 'axios';
import Web3 from 'web3';
import { abi, address } from '../constant/contract';

const web3 = new Web3(new Web3.providers.HttpProvider('https://cloudflare-eth.com'));
const Storage = new web3.eth.Contract(abi, address);

export default {
  data() {
    return {
      metadata: {},
      imageSource: '',
      txHash: this.$route.query.tx,
      txTimeStamp: 0,
    };
  },
  computed: {
    hash() {
      return this.$route.params.hash;
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
        const ipfsHash = ipldData['@id'].replace('ipfs://', '');
        this.imageSource = `https://ipfs.infura.io/ipfs/${ipfsHash}`;
        this.metadata = ipldData;
      } else {
        this.imageSource = this.hash;
      }
      if (!this.txHash) {
        const events = await Storage.getPastEvents('Data', {
          fromBlock: 8300000,
          // filter: {
          //     from: FROM_ADDRESS,
          // },
        });
        const event = events.find((e) => {
          const { data } = e.returnValues;
          if (data === this.hash) {
            return true;
          }
          if (data && data[0] === '[') {
            try {
              return !!JSON.parse(data).find(h => h === this.hash);
            } catch (err) {
              // no op
            }
          }
          return false;
        });
        if (event) {
          this.txHash = event.transactionHash;
        }
      }
      if (this.txHash) {
        const { blockNumber } = await web3.eth.getTransaction(this.txHash);
        if (blockNumber) this.txTimeStamp = (await web3.eth.getBlock(blockNumber)).timestamp * 1000;
      }
    }
  },
};
</script>
