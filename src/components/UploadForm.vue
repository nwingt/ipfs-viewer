<template>
  <v-form v-model="valid">
    <v-container grid-list-xl>
      <v-layout wrap>
        <v-file-input label="Image Upload"></v-file-input>
        <v-flex
          xs12
          md4
        >
          <v-date-picker
            v-model="dateTime"
            label="Date Time"
            required
          ></v-date-picker>
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
            v-model="description"
            label="Description"
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
          md4
        >
          <v-text-field
            v-model="license"
            label="License"
            required
          ></v-text-field>
        </v-flex>

        <v-btn>Submit</v-btn>

      </v-layout>
    </v-container>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    dateTime: Date.now(),
    latitude: 0,
    longitude: 0,
    description: '',
    author: '',
    license: 'GPLv3',
  }),
};
</script>
