<template>
  <div class="about">
    <v-container class="blue-grey lighten-4" fluid>
      <v-container class="mt-12">
        <v-img src="../assets/logo.svg" max-width="120" />
        <div class="display-2 my-2 font-weight-bold blue-grey--text text--darken-3">ISCN</div>
        <h3 class="title blue-grey--text mb-8">
          International Standard Content Number, a worldwide unique number and metadata to identify
          a content
        </h3>
      </v-container>
    </v-container>
    <v-container fluid>
      <UploadForm />
    </v-container>
  </div>
</template>

<script>
import UploadForm from '../components/UploadForm.vue';

export default {
  components: {
    UploadForm,
  },
};
</script>
