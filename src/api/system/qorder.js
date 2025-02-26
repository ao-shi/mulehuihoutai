import request from '@/utils/request'

// 查询抢购订单管理列表
export function listQorder(query) {
  return request({
    url: '/system/qorder/list',
    method: 'get',
    params: query
  })
}

// 查询抢购订单管理详细
export function getQorder(id) {
  return request({
    url: '/system/qorder/' + id,
    method: 'get'
  })
}

// 新增抢购订单管理
export function addQorder(data) {
  return request({
    url: '/system/qorder',
    method: 'post',
    data: data
  })
}

// 修改抢购订单管理
export function updateQorder(data) {
  return request({
    url: '/system/qorder',
    method: 'put',
    data: data
  })
}

// 删除抢购订单管理
export function delQorder(id) {
  return request({
    url: '/system/qorder/' + id,
    method: 'delete'
  })
}
