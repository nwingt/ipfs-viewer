<template>
  <v-form @submit.prevent="onSubmit">
    <v-container grid-list-xl>
      <v-layout wrap>
        <v-flex xs12>
          <v-alert
            v-if="web3Error"
            value="true"
            prominent
            type="error"
          >{{ web3Error }}</v-alert>
        </v-flex>
        <v-flex xs12>
          <v-file-input
            v-model="file"
            label="Image Upload"
            @change="processEXIF"
          ></v-file-input>
        </v-flex>
        <v-flex
          xs12
          md4
        >
          <v-menu
            v-model="isDatePickerDialogOpen"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="dateTime"
                label="Date Time"
                readonly
                required
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dateTime"
              label="Date Time"
              required
              @input="isDatePickerDialogOpen = false"
            ></v-date-picker>
          </v-menu>
        </v-flex>

        <v-flex
          xs12
          md4
        >
          <v-text-field
            v-model="latitude"
            label="Latitude"
            required
          ></v-text-field>
        </v-flex>

        <v-flex
          xs12
          md4
        >
          <v-text-field
            v-model="longitude"
            label="Longitude"
            required
          ></v-text-field>
        </v-flex>

        <v-flex
          xs12
          md4
        >
          <v-text-field
            v-model="author"
            label="Author"
            required
          ></v-text-field>
        </v-flex>

        <v-flex
          xs12
          md6
        >
          <v-text-field
            v-model="description"
            label="Description"
            required
          ></v-text-field>
        </v-flex>

        <v-flex
          xs12
          md2
        >
          <v-text-field
            v-model="license"
            label="License"
            required
          ></v-text-field>
        </v-flex>

        <v-flex
          class="text-center text-md-right"
          xs12
        >
          <v-btn
            type="submit"
            color="primary"
            :disabled="web3Error || !file"
            :loading="isLoading"
            large
          >Upload</v-btn>
        </v-flex>

      </v-layout>
    </v-container>
  </v-form>
</template>

<script>
import Web3 from 'web3';
import { abi, address } from '../constant/contract';

const ipfsClient = require('ipfs-http-client');
const exifParser = require('exif-parser');

const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });

function processDateTime(datetime) {
  let dateObj = datetime;
  if (typeof datetime === 'string') {
    return datetime.substr(0, 10);
  }
  if (typeof datetime === 'number') {
    let epoch = datetime;
    if (epoch < 10000000000) {
      epoch *= 1000;
    }
    dateObj = new Date(epoch);
  }
  return dateObj.toISOString().substr(0, 10);
}

// From: https://github.com/mshibl/Exif-Stripper/blob/master/exif-stripper.js
function removeExif(imageArrayBuffer) {
  const dv = new DataView(imageArrayBuffer);
  let offset = 0;
  let recess = 0;
  const pieces = [];
  if (dv.getUint16(offset) === 0xffd8) {
    offset += 2;
    let app1 = dv.getUint16(offset);
    offset += 2;
    while (offset < dv.byteLength) {
      if (app1 === 0xffe1) {
        pieces.push({ recess, offset: offset - 2 });
        recess = offset + dv.getUint16(offset);
      } else if (app1 === 0xffda) {
        break;
      }
      offset += dv.getUint16(offset);
      app1 = dv.getUint16(offset);
      offset += 2;
    }
    if (pieces.length > 0) {
      const newPieces = [];
      pieces.forEach((v) => {
        newPieces.push(imageArrayBuffer.slice(v.recess, v.offset));
      });
      newPieces.push(imageArrayBuffer.slice(recess));
      const blob = new Blob(newPieces, { type: 'image/jpeg' });
      return new File([blob], 'image.jpeg', { lastModified: Date.now() });
    }
  }
  return null;
}

export default {
  data: () => ({
    hasExif: false,
    hasWeb3Inited: false,
    isSubmitting: false,
    isProcessingEXIF: false,
    isDatePickerDialogOpen: false,

    file: null,
    dateTime: processDateTime(new Date()),
    latitude: 0,
    longitude: 0,
    description: '',
    author: '',
    license: 'CC0',

    web3: null,
    web3Error: '',
  }),
  computed: {
    isLoading() {
      return this.isProcessingEXIF || this.isSubmitting;
    },
    uploadFormat() {
      return {
        '@context': 'https://schema.org',
        '@type': 'Photograph',
        '@id': '',
        dateCreated: processDateTime(this.dateTime),
        datePublished: processDateTime(new Date()),
        license: this.license,
        contentLocation: {
          '@type': 'Place',
          geo: {
            '@type': 'GeoCoordinates',
            latitude: this.latitude,
            longitude: this.longitude,
          },
        },
      };
    },
  },
  mounted() {
    this.setUpEth();
  },
  methods: {
    async processEXIF(file) {
      this.isProcessingEXIF = true;
      try {
        const buf = await file.arrayBuffer();
        const exifData = exifParser.create(buf).parse();
        console.log(exifData);
        if (!exifData.app1Offset) {
          this.hasExif = false;
          return;
        }

        this.hasExif = true;
        const {
          Artist,
          CreateDate,
          GPSLatitude,
          GPSLatitudeRef,
          GPSLongitude,
          GPSLongitudeRef,
          ImageDescription,
        } = exifData;
        if (Artist) {
          this.author = Artist;
        }
        if (CreateDate) {
          this.dateTime = processDateTime(CreateDate);
        }
        if (GPSLatitude && GPSLatitudeRef) {
          this.latitude = `${GPSLatitude}${GPSLatitudeRef}`;
        }
        if (GPSLongitude && GPSLongitudeRef) {
          this.longitude = `${GPSLongitude}${GPSLongitudeRef}`;
        }
        if (ImageDescription) {
          this.description = ImageDescription;
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.isProcessingEXIF = false;
      }
    },
    async onSubmit() {
      if (!this.hasWeb3Inited) await this.setUpEth();
      const [from] = await this.web3.eth.getAccounts();
      if (!from) {
        this.web3Error = 'Please unlock your wallet';
        return;
      }
      this.isSubmitting = true;
      let { file } = this;
      if (this.hasExif) {
        const buf = await this.file.arrayBuffer();
        file = removeExif(buf);
        if (!file) {
          ({ file } = this);
        }
      }
      const ipfsResult = await ipfs.add(file);
      const input = {
        ...this.uploadFormat,
        datePublished: processDateTime(new Date()),
        '@id': ipfsResult[0].hash,
      };
      const ipld = await ipfs.dag.put(input, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256',
      });
      const ipldHash = ipld.toBaseEncodedString();
      const txHash = await this.ethUpload(ipldHash);
      this.isSubmitting = false;
      this.$router.push({ name: 'view', params: { hash: ipldHash }, query: { tx: txHash } });
    },
    async setUpEth() {
      this.web3Error = '';
      if (window.ethereum) {
        const { ethereum } = window;
        this.web3 = new Web3(ethereum);
        try {
          await ethereum.enable();
          const network = await this.web3.eth.net.getNetworkType();
          if (network !== 'main') {
            this.web3Error = 'Please switch to Main Network';
            return;
          }
          this.hasWeb3Inited = true;
          this.Storage = new this.web3.eth.Contract(abi, address);
        } catch (err) {
          this.web3Error = 'Please accept the connect request in Metamask';
          console.error(err);
        }
      } else {
        this.web3Error = 'Please install MetaMask https://metamask.io/';
      }
    },
    async ethUpload(inputData) {
      const [from] = await this.web3.eth.getAccounts();
      let data = inputData;
      if (typeof data !== 'string') {
        data = JSON.stringify(data);
      }
      const send = this.Storage.methods.store(data).send({
        from,
      });
      return new Promise((resolve, reject) => send
        .once('transactionHash', resolve)
        .on('error', reject));
    },
  },
};
</script>
