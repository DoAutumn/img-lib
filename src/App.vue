<script setup lang="ts">
import { ref } from 'vue'
import { ElImage } from 'element-plus'
import service from './request'

const fullImgs = ref([])

const Img_RegExp = /.(GIF|JPG|JPEG|PNG|WebP|TIFF|BMP|HEIF|SVG)$/i

const getImgsFromGitee = async (path = '/') => {
  return await service({
    url: `/contents/${path}?access_token=b1655e5fc6a8777cd5248c832c6de3ce`,
    method: 'get'
  })
}

const getImgs = async (path = '/', imgs = []) => {
  try {
    const res = await getImgsFromGitee(path)
    for (const img of res) {
      if (img.type === 'dir') {
        await getImgs(img.path, imgs)
      } else if (Img_RegExp.test(img.name)) {
        img.category = path
        imgs.push(img)
      }
    }
  } catch (error) {
    console.error('获取图片列表失败', error)
  }
  return imgs
}

getImgs().then(imgs => {
  fullImgs.value = imgs
  console.log(fullImgs.value);
})
</script>

<template>
  <div v-for="img in fullImgs" :key="img.sha" class="image">
    <el-image lazy :src="img.download_url" :fit="'contain'" />
    <div class="info">
      <p>
        <svg t="1727276960258" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1477" width="12" height="12"><path d="M933.376 693.646222l-239.672889 239.672889a112.981333 112.981333 0 0 1-159.800889 0L88.348444 487.822222A111.217778 111.217778 0 0 1 56.888889 398.904889V113.777778a56.888889 56.888889 0 0 1 56.888889-56.888889h285.127111a111.217778 111.217778 0 0 1 88.974222 31.345778l445.496889 445.496889a112.981333 112.981333 0 0 1 0 159.914666zM227.555556 170.666667a56.888889 56.888889 0 1 0 56.888888 56.888889 56.888889 56.888889 0 0 0-56.888888-56.888889z m548.750222 378.083555l-227.555556 227.555556 40.220445 40.220444 227.555555-227.555555z" fill="#FF9800" p-id="1478"></path></svg>
        {{ img.category }}
      </p>
      <p>
        <svg t="1727277037649" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8510" width="12" height="12"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136v-39.9l138.5-164.3 150.1 178L658.1 489 888 761.6V792z m0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752v430.2zM304 456c48.6 0 88-39.4 88-88s-39.4-88-88-88-88 39.4-88 88 39.4 88 88 88z m0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28z" fill="#1296DB" p-id="8511"></path></svg>
        {{ img.name }}
      </p>
    </div>
  </div>
</template>

<style>
.image {
  display: inline-flex;
  flex-direction: column;
  height: 160px;
  overflow: hidden;
  margin: 8px;
}

.el-image {
  height: calc(100% - 45px);
}

.el-image__inner {
  height: 100%;
  border-radius: 10px;
  transition: .3s ease-out;
}

.el-image__inner:hover {
  transform: scale(1.05);
}

.image .info {
  height: 40px;
  margin-top: 5px;
}

.image p {
  margin: 0;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.image p svg {
  margin-right: 5px;
}
</style>
