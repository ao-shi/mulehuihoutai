import request from '@/utils/request'

// 查询积分商品列表
export function listIntegral_goods(query) {
  return request({
    url: '/system/integral-goods/list',
    method: 'get',
    params: query
  })
}

// 查询积分商品详细
export function getIntegral_goods(id) {
  return request({
    url: '/system/integral-goods/' + id,
    method: 'get'
  })
}

// 新增积分商品
export function addIntegral_goods(data) {
  return request({
    url: '/system/integral-goods',
    method: 'post',
    data: data
  })
}

// 修改积分商品
export function updateIntegral_goods(data) {
  return request({
    url: '/system/integral-goods',
    method: 'put',
    data: data
  })
}

// 删除积分商品
export function delIntegral_goods(id) {
  return request({
    url: '/system/integral-goods/' + id,
    method: 'delete'
  })
}
