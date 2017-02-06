let lrz = window.lrz;

let uploadFile = ['ENV', 'Tips', 'CommonService', function (ENV, Tips, CommonService) {
    return {
        scope: {
            picurl: '=',   //显示图片URL
            param: '='     //上传所需参数
        },
        link: function (scope, element, attrs) {
            element.bind('change', function (changeEvent) {

                var reader = new FileReader();
                reader.onload = function () {
                    scope.$apply(function () {
                        scope.file = changeEvent.target.files[0];
                    });

                    //上传执行
                    upload();
                };
                reader.readAsDataURL(changeEvent.target.files[0]);

                //上传图片
                function upload() {
                    var tData = new FormData(),
                        picName = attrs.filename;
                    tData.append('type', scope.param.type);
                    tData.append('org_id', scope.param.org_id);

                    //图片格式验证
                    if (!/image\/\w+/.test(scope.file.type)) {
                        alert('只支持jpg、png、bitmap格式的图片！');
                        return false;
                    }

                    //压缩图片
                    lrz(scope.file, {
                        width: 1500,
                        height: 1500,
                        quality: 0.3
                    })
                        .then(function (rst) {

                            tData.append(picName, rst.lrzfile.fileObj);

                            //图片上传请求
                            CommonService.post(ENV.adminApi + 'file_upload', tData, { headers: { 'Content-Type': undefined } }).then((res) => {
                                Tips.show('数据加载中...');
                                if (res.code === 0) {
                                    //上传成功设置图片路径
                                    scope.picurl = res.result[attrs.filename];
                                    Tips.hide();
                                } else {
                                    Tips.showHide(res.message);
                                }
                            }, (error) => {
                                console.log('Failed: ', error);
                                Tips.showHide(error.message);
                            });

                            return rst;
                        })
                        .catch(function (err) {
                            //错误信息
                            Tips.showHide('对不起，图片太大，加载失败，请重试！');
                            console.log(err);
                        });
                }

            });
        }
    };
}];

export default uploadFile;