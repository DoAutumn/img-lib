<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { ElButton, ElInput, ElDialog } from 'element-plus'

const props = defineProps({
  close: {
    type: Function,
    default: () => { }
  }
})

const inputText = ref('')

const visible = ref(false)

const onConfirm = () => {
  visible.value = false
  props.close?.(true, inputText.value)
}

const onClose = () => {
  visible.value = false
  props.close?.(false)
}

onBeforeMount(() => {
  visible.value = true
});

</script>

<template>
  <el-dialog
    v-model="visible"
    :title="'存储路径'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    width="450"
    >
    <el-input v-model="inputText" placeholder="上传图片的存储路径" />
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">上传</el-button>
    </template>
  </el-dialog>
</template>

<style lang="less">
</style>