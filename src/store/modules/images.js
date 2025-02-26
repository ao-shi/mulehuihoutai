import { ref } from "vue"

// 轮播图模块
export const useImagesStore = defineStore('images',()=>{
    const images = ref(JSON.parse(localStorage.getItem('images') || '[]'))

    const addImages = (image) => {
        images.value.push(image)
        saveToLocalStorage()
    }

    const saveToLocalStorage = () => {
        localStorage.setItem('images', JSON.stringify(images.value))
    }
  return {
    images,
    addImages
    }
})