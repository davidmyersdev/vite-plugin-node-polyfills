<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    // eslint-disable-next-line n/prefer-global/buffer
    const msg = ref(Buffer.from(Buffer.from('Hello, friend!').toString('base64'), 'base64').toString('ascii'))

    return {
      msg,
    }
  },
})
</script>

<template>
  <div>{{ msg }}</div>
</template>
