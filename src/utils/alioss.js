import OSS from 'ali-oss';

export const client = new OSS({
    region: 'oss-cn-beijing',
    accessKeyId: 'LTAI5tSTLuAFjixshKmb51DV',
    accessKeySecret: 'izPpJiW5XMNhkVrBfncfl03HCgQtAR',
    bucket: 'mulehui',
    endpoint: 'https://oss-cn-beijing.aliyuncs.com'
});