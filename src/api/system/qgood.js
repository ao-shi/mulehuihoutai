import request from '@/utils/request'

// 查询抢购商品管理列表
export function listQgood(query) {
  return request({
    url: '/system/qgood/list',
    method: 'get',
    params: query
  })
}

// 查询抢购商品管理详细
export function getQgood(id) {
  return request({
    url: '/system/qgood/' + id,
    method: 'get'
  })
}

// 新增抢购商品管理
export function addQgood(data) {
  return request({
    url: '/system/qgood',
    method: 'post',
    data: data
  })
}

// 修改抢购商品管理
export function updateQgood(data) {
  return request({
    url: '/system/qgood',
    method: 'put',
    data: data
  })
}

// 删除抢购商品管理
export function delQgood(id) {
  return request({
    url: '/system/qgood/' + id,
    method: 'delete'
  })
}
