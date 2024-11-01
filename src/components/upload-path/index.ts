import { createVNode, render } from 'vue'
import UploadPath from './index.vue'

export const uploadPath = (): Promise<string> => {
  return new Promise(resolve => {
    const container = document.createElement('div')

    /**
     * 为了 el-dialog 的消失动画，这里加个延时再销毁
     */
    const destory = () => {
      setTimeout(() => {
        container.remove()
      }, 150)
    }

    const vnode = createVNode(UploadPath, {
      close: (res: boolean, path: string) => {
        res && resolve(path)
        destory()
      }
    })

    render(vnode, container)
    document.body.appendChild(container)
  })
}