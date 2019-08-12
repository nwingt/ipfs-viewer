<template>
  <v-container class="view-page py-8">
    <v-card
      class="mx-auto"
      flat
      outlined
    >
      <v-img
        v-if="imageSource"
        :src="imageSource"
      />
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
                  <a :href="`https://etherscan.io/tx/${filtered[key]}`" target="blank">{{ filtered[key] }}</a>
                </template>
                <template v-else-if="key === '@id'">
                  <a :href="`https://ipfs.io/ipfs/${filtered[key]}`" target="blank">{{ filtered[key] }}</a>
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

function checkLogsContainIpld(logs, ipldHash) {
  const inputs = [
    {
      indexed: true,
      name: 'from',
      type: 'address',
    },
    {
      indexed: false,
      name: 'data',
      type: 'string',
    },
  ];
  for (let i = 0; i < logs.length; i += 1) {
    const { data, topics } = logs[i];
    const result = web3.eth.abi.decodeLog(inputs, data, topics);
    console.log(result.data);
    if (result.data === ipldHash) {
      return true;
    }
    if (result.data[0] === '[') {
      try {
        const dataArr = JSON.parse(result.data);
        for (let j = 0; j < dataArr.length; j += 1) {
          if (dataArr[j] === ipldHash) {
            return true;
          }
        }
      } catch (err) {
        // no op
      }
    }
  }
  return false;
}

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
          const { blockNumber } = await web3.eth.getTransaction(this.txHash);
          this.txTimeStamp = (await web3.eth.getBlock(blockNumber)).timestamp * 1000;
        }
      } else {
        const { blockNumber, logs } = await web3.eth.getTransactionReceipt(this.txHash);
        if (blockNumber) {
          if (checkLogsContainIpld(logs, this.hash)) {
            this.txTimeStamp = (await web3.eth.getBlock(blockNumber)).timestamp * 1000;
          } else {
            this.txHash = '';
          }
        }
      }
    }
  },
};
</script>

<style lang="scss">
.view-page {
  .v-card {
    max-width: 768px;
  }
}
</style>
