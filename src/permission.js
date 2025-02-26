import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

// router.beforeEach((to, from, next) => {
//   NProgress.start()
//   if (getToken()) {
//     to.meta.title && useSettingsStore().setTitle(to.meta.title)
//     /* has token*/
//     if (to.path === '/login') {
//       next({ path: '/' })
//       NProgress.done()
//     } else if (isWhiteList(to.path)) {
//       next()
//     } else {
//       if (useUserStore().roles.length === 0) {
//         isRelogin.show = true
//         // 判断当前用户是否已拉取完user_info信息
//         useUserStore().getInfo().then(() => {
//           isRelogin.show = false
//           usePermissionStore().generateRoutes().then(accessRoutes => {
//             // 根据roles权限生成可访问的路由表
//             accessRoutes.forEach(route => {
//               if (!isHttp(route.path)) {
//                 router.addRoute(route) // 动态添加可访问路由表
//               }
//             })
//             next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
//           })
//         }).catch(err => {
//           useUserStore().logOut().then(() => {
//             ElMessage.error(err)
//             next({ path: '/' })
//           })
//         })
//       } else {
//         next()
//       }
//     }
//   } else {
//     // 没有token
//     if (isWhiteList(to.path)) {
//       // 在免登录白名单，直接进入
//       next()
//     } else {
//       next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
//       NProgress.done()
//     }
//   }
// })
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
                console.log(route,"route")
              }
            })
            console.log(to.fullPath,"to.fullPath")
            if (to.fullPath == '/index') {
              console.log(accessRoutes,"accessRoutes")
              // 当登录之后，直接通过ip地址和端口号访问时，跳转到第一个路由页面indexPage
              let pathIndex = ''
              //通过权限返回菜单去避免 如有首页权限 出现//index 情况
              if (accessRoutes[0].path == '/') {// 一级路由就是可以打开的页面
                pathIndex = accessRoutes[0].path + accessRoutes[0].children[0].path
                console.log(pathIndex,"pathIndex1")
              } else{// 一级路由下面的二级路由才是可以打开的页面
                 pathIndex = accessRoutes[0].path + '/' + accessRoutes[0].children[0].path
                 console.log(pathIndex,"pathIndex2")
              }
              next({ path: pathIndex, replace: true }) // hack方法 确保addRoutes已完成
            } else {
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
            }
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
