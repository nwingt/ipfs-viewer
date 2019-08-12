<template>
  <v-form @submit.prevent="onSubmit">
    <v-container grid-list-xl>
      <v-layout wrap>
        <v-flex xs12>
          <v-file-input v-model="file" label="Image Upload"></v-file-input>
        </v-flex>

        <v-flex
          xs12
          md4
        >
          <v-menu
            v-model="datePickerDialog"
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
              @input="datePickerDialog = false"
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
            large
          >Upload</v-btn>
        </v-flex>

      </v-layout>
    </v-container>
  </v-form>
</template>

<script>
const ipfsClient = require('ipfs-http-client');

const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });

export default {
  data: () => ({
    datePickerDialog: false,
    dateTime: new Date().toISOString().substr(0, 10),
    latitude: 0,
    longitude: 0,
    description: '',
    author: '',
    license: 'GPLv3',
    file: null,
  }),
  computed: {
    uploadFormat() {
      return {
        '@context': 'https://schema.org',
        '@type': 'Photograph',
        '@id': '',
        dateCreated: this.dateTime.toString(),
        datePublished: Date.now(),
        license: this.license,
        contentLocation: {
          '@type': 'Place',
          geo: {
            '@type': 'GeoCoordinates',
            latitude: this.latitude,
            longtiude: this.longtiude,
          },
        },
      };
    },
  },
  methods: {
    async onSubmit() {
      const ipfsResult = await ipfs.add(this.file);
      const input = {
        ...this.uploadFormat,
        datePublished: new Date().toISOString().substr(0, 10),
        '@id': ipfsResult[0].hash,
      };
      const ipld = await ipfs.dag.put(input, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256',
      });
      const ipldHash = ipld.toBaseEncodedString();
      this.$router.push({ name: 'view', params: { hash: ipldHash } });
    },
  },
};
</script>
