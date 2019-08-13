<template>
  <div class="about">
    <v-container>
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
