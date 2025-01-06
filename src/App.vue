<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { ref } from 'vue'
import { ElImage, ElInput, ElLoading, ElMessage, ElUpload, UploadRequestOptions } from 'element-plus'
import request from './request'
import { uploadPath } from './components/upload-path';

type Img = {
  name: string,
  path: string,
  type: string,
  sha: string,
  download_url: string,
}

const Img_RegExp = /.(GIF|JPG|JPEG|PNG|WebP|TIFF|BMP|HEIF|SVG)$/i

const { copy } = useClipboard()

const search = ref('')
const fullImgs = ref<Img[]>([])
const showImgs = ref<Img[]>([])
const uploadedImgs = ref<Img[]>([])

const getImgsFromGitee = async (path = '/'): Promise<Img[]> => {
  return await request({
    url: `/contents/${path}?access_token=c90d9f578adc21de50b934d718255ca2`,
    method: 'get'
  })
}

const getImgs = async (path = '/', imgs: Img[] = []) => {
  try {
    const res = await getImgsFromGitee(path)
    for (const img of res) {
      if (img.type === 'dir') {
        await getImgs(img.path, imgs)
      } else if (Img_RegExp.test(img.name)) {
        imgs.push(img)
      }
    }
  } catch (error) {
    console.error('获取图片列表失败', error)
  }
  return imgs
}

const onSearch = () => {
  const fun = () => {
    if (search.value) {
      showImgs.value = fullImgs.value.filter(img => img.path.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()))
    } else {
      showImgs.value = [...fullImgs.value]
    }
  }
  if (!fullImgs.value.length) {
    const instance = ElLoading.service()
    getImgs().then(imgs => {
      instance.close()
      fullImgs.value = imgs
      fun()
    })
    return
  }
  fun()
}

const onCopy = (event: MouseEvent, img: Img) => {
  copy(event.altKey ? img.download_url : event.shiftKey ? `<img width="500" alt="${img.name}" src="${img.download_url}">` : `![${img.name}](${img.download_url})`)
  ElMessage.success('图片地址复制成功')
}

const onElUpload = (options: UploadRequestOptions): Promise<unknown> => {
  return uploadPath().then((path) => {
    return onUpload(options.file, path)
  })
}

const onUpload = (file: File, path: string) => {
  return new Promise((resolve, reject) => {
    const instance = ElLoading.service()
    const reader = new FileReader()
    reader.onload = () => {
      request({
        url: `/contents/${path}/${file.name}`,
        method: 'post',
        data: {
          content: (reader.result as string).replace(`data:${file.type};base64,`, ''),
          access_token: 'c90d9f578adc21de50b934d718255ca2',
          message: 'upload image',
        }
      })
      .then((res: any) => {
        uploadedImgs.value.push(res.content)
        resolve(res.content)
        instance.close()
      })
      .catch(err => {
        reject(err)
        instance.close()
      })
    }
    reader.onerror = (err) => {
      reject(err)
      instance.close()
    }
    reader.readAsDataURL(file)
  })
}

// getImgs().then(imgs => {
//   fullImgs.value = imgs
//   showImgs.value = [...imgs]
// })

document.addEventListener('paste', (event: ClipboardEvent) => {
  const files = event.clipboardData?.files
  if (!files?.length) return
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.type.startsWith('image')) {
      uploadPath().then((path) => {
        onUpload(file, path)
      })
    }
  }
})
</script>

<template>
  <div class="search-box">
    <el-image :src="'./avatar.jpg'" :fit="'contain'" />
    <span class="name">DoAutumn图床</span>
    <div class="search">
      <el-input v-model="search" placeholder="搜索" @keyup.enter="onSearch" />
      <svg @click="onSearch" t="1727319955975" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4280" width="26" height="26"><path d="M948.48 833.92l-185.6-183.68c-3.84-3.84-8.32-6.4-13.44-7.68C801.28 580.48 832 501.76 832 416 832 221.44 674.56 64 480 64 285.44 64 128 221.44 128 416 128 610.56 285.44 768 480 768c85.76 0 163.84-30.72 225.28-81.28 1.92 4.48 4.48 8.96 8.32 12.8l185.6 183.68c14.08 13.44 35.84 13.44 49.92 0S962.56 847.36 948.48 833.92zM480 704C320.64 704 192 575.36 192 416 192 256.64 320.64 128 480 128 639.36 128 768 256.64 768 416 768 575.36 639.36 704 480 704z" p-id="4281" fill="#1296db"></path></svg>
    </div>
    <a href="https://gitee.com/doautumn/doautumn.gitee.io" target="_blank" rel="noopener noreferrer" class="gitee">
      <el-image :src="'./gitee.ico'" :fit="'contain'"></el-image>
    </a>
  </div>
  <el-upload class="upload-box" drag multiple accept="image/*" :show-file-list="false" :http-request="onElUpload">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="44" height="44"><path fill="#a8abb2" d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0 1 64 624c0-123.136 93.12-223.488 212.608-237.248A239.808 239.808 0 0 1 512 192a239.872 239.872 0 0 1 235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 0 1-240 240c-5.376 0-10.56-1.28-16-1.6v1.6z"></path></svg>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
  </el-upload>
  <ul class="el-upload-list el-upload-list--picture">
    <li v-for="img in uploadedImgs" :key="img.sha" class="el-upload-list__item is-success" @click="onCopy($event, img)">
      <img :src="img.download_url" class="el-upload-list__item-thumbnail" alt="">
      <div class="el-upload-list__item-info">
        <a class="el-upload-list__item-name">
          <span class="el-upload-list__item-file-name">{{ img.name }}</span>
        </a>
      </div>
      <label class="el-upload-list__item-status-label">
        <i class="el-icon el-icon--upload-success el-icon--check">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#f5f7fa" d="M406.656 706.944 195.84 496.256a32 32 0 1 0-45.248 45.248l256 256 512-512a32 32 0 0 0-45.248-45.248L406.592 706.944z"></path></svg>
        </i>
      </label>
    </li>
  </ul>
  <div class="container">
    <div v-for="img in showImgs" :key="img.sha" class="image">
      <el-image lazy :src="img.download_url" :fit="'contain'" />
      <div class="info">
        <p>
          <svg t="1727276960258" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1477" width="12" height="12"><path d="M933.376 693.646222l-239.672889 239.672889a112.981333 112.981333 0 0 1-159.800889 0L88.348444 487.822222A111.217778 111.217778 0 0 1 56.888889 398.904889V113.777778a56.888889 56.888889 0 0 1 56.888889-56.888889h285.127111a111.217778 111.217778 0 0 1 88.974222 31.345778l445.496889 445.496889a112.981333 112.981333 0 0 1 0 159.914666zM227.555556 170.666667a56.888889 56.888889 0 1 0 56.888888 56.888889 56.888889 56.888889 0 0 0-56.888888-56.888889z m548.750222 378.083555l-227.555556 227.555556 40.220445 40.220444 227.555555-227.555555z" fill="#FF9800" p-id="1478"></path></svg>
          {{ img.path.substring(0, img.path.lastIndexOf('/')) || '/' }}
        </p>
        <p @click="onCopy($event, img)">
          <svg t="1727277037649" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8510" width="12" height="12"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136v-39.9l138.5-164.3 150.1 178L658.1 489 888 761.6V792z m0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752v430.2zM304 456c48.6 0 88-39.4 88-88s-39.4-88-88-88-88 39.4-88 88 39.4 88 88 88z m0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28z" fill="#1296DB" p-id="8511"></path></svg>
          {{ img.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.search-box {
  display: flex;
  align-items: center;
  padding: 20px 40px;

  .el-image {
    width: 24px;
    margin-right: 6px;
  }
  .gitee {
    width: 20px;
    height: 20px;
    margin-left: 10px;
    .el-image {
      width: 20px;
    }
  }

  .name {
    font-size: 20px;
    font-weight: 600;
  }

  .search {
    width: 450px;
    height: 44px;
    border-radius: 24px;
    box-shadow: 0 0 0 1px rgba(0,0,0,.05),0 2px 4px 1px rgba(0,0,0,.09);
    display: inline-flex;
    align-items: center;
    padding: 0 20px;
    margin-left: 15px;

    .el-input__wrapper {
      box-shadow: none;
      padding-left: 0;
    }
  }
}

.upload-box {
  padding: 0 40px;

  .el-upload-dragger {
    padding: 20px 0;
  }
}

.el-upload-list {
  padding: 0 40px;

  .el-upload-list__item-status-label {
    opacity: 1 !important;
  }
}

.container {
  padding: 10px 40px;
}

.image {
  display: inline-flex;
  flex-direction: column;
  height: 160px;
  overflow: hidden;
  margin-right: 16px;
  margin-bottom: 16px;

  .el-image {
    height: calc(100% - 45px);
    border-radius: 10px;
    border: solid 1px #eee;

    .el-image__inner {
      height: 100%;
      transition: .3s ease-out;

      &:hover {
        transform: scale(1.15);
      }
    }

    .el-image__error {
      display: inline-block;
      text-align: center;
      vertical-align: top;
    }
  }

  .info {
    height: 40px;
    margin-top: 5px;

    p {
      margin: 0;
      font-size: 13px;
      display: flex;
      align-items: center;

      &:last-child {
        cursor: pointer;
      }

      svg {
        margin-right: 5px;
      }
    }
  }
}
</style>
