<template>
  <v-container class="about">
    <v-img
      v-if="imageSource"
      :src="imageSource"
    ></v-img>
    <v-simple-table>
      <tbody>
        <tr
          v-for="key in Object.keys(metadata)"
          :key="key"
        >
          <td>{{ key }}</td>
          <td>{{ metadata[key] }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    metadata: '',
    imageSource: '',
  }),
  computed: {
    hash() {
      return this.$route.params.hash;
    },
    filtered() {
      return this.metadata;
    },
  },
  async mounted() {
    if (this.hash) {
      const { data } = await axios.get(`https://ipfs.io/api/v0/dag/get?arg=${this.hash}`);
      if (data['@id']) {
        const ipfsHash = data['@id'].replace('ipfs://', '');
        this.imageSource = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
      } else {
        this.imageSource = this.hash;
      }
    }
  },
};
</script>
