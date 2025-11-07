<template>
  <div class="fixed bottom-4 right-4 z-50">
    <ToastNotification
      v-for="notification in notifications"
      :key="notification.id"
      :id="notification.id"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @dismiss="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '../services/notification'
import ToastNotification from './ToastNotification.vue'

const { notifications, removeNotification } = useNotification()
</script>
