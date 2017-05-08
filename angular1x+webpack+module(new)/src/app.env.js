export default {
    version: 1.0,
    adminApi: 'http://192.168.0.100:18000/api/approval/v2.0/',
    tabsConfig: {
        addbtn: '创建数据',
        list: [{
            text: '已发布',
            url: 'modelProperty({id:1})'
        }, {
            text: '草稿',
            url: 'modelProperty({id:2})'
        }, {
            text: '下架',
            url: 'modelProperty({id:3})'
        }]
    }
};