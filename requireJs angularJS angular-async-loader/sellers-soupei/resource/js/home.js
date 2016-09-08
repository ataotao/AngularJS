/**************************
 *控制器全局部分
 **************************/
app.controller('indexController', ['$scope', '$rootScope', '$state', '$timeout', 'traVal', function($scope, $rootScope, $state, $timeout, traVal) {
    
    //全局错误提示初始化
    $rootScope.errAlertModalConstant = {};
    //初始化标书订单和历史订单提示红点
    $scope.noticeObj = {};

    //页面加载处理
    var overlay = angular.element(document.querySelector('#overlay'));

    $timeout(function() {
        //订单中心主页初始化
        traVal.initordercenterFn(function(res, status, headers, config) {
            //显示loading提示
            overlay.addClass('show').removeClass('hidden');
            
            if (res.code === 0) {
                //获取初始化信息
                $rootScope.initordercenter = res.result.initData;

                //识别子帐号数量
                if ($rootScope.initordercenter.subAccountCount < 5) {
                    if (!localStorage.getItem('accountViewState')) {
                        $scope.accountViewState = 'unread';
                    }else{
                        $scope.accountViewState = 'read';
                    }
                }

                $scope.getAccountView = function(){
                    localStorage.setItem('accountViewState', true);
                    $scope.accountViewState = 'read';
                };

                //临时变量,找出错误后删除
                initData = res.result.initData;

                //存储初始化信息
                localSaveJsonStorage(res.result.initData);

                //订单socket连接
                socketOrder($rootScope.initordercenter.curUserId, $rootScope.initordercenter.companyInfo.org_id);

                //隐藏loading提示
                overlay.addClass('hidden').removeClass('show');

                //初始化加载完毕变量
                $rootScope.loadingEnd = true;

                //talkingdata
                createJs("http://sdk.talkingdata.com/app/h5/v1?appid=2E29078333751C434A74C02E5B76ACEF&vn=v3.0", "talkingdata");

                //获取新订单微信消息通知开关(补丁，获取用户是否设置微信开关)
                traVal.getBiddocWxNotifySwitchFn(function(res, status, headers, config) {
                    //输出列表内容
                    if (res.code === 0) {
                    }else{
                        //错误信息
                        console.log(errCode(res.code));
                    }
                }, function(res, status, headers, config) {
                    //错误信息
                    console.log(errCode());
                });

            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                };
            }

        }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                };
        });
    });


    $scope.$on('$stateChangeSuccess', function(event) {

        //head头部tab控制
        var topMenu = $scope.topMenu = {};
        if ($state.current.name == 'order') {
            topMenu.activeTab = 'order';
        } else if ($state.current.name == 'historyOrder') {
            topMenu.activeTab = 'historyOrder';
        } else if ($state.current.name.substr(0, 7) == 'account') {
            topMenu.activeTab = 'account';
        }

    });

    //积分商城 获取免登陆
    $scope.autologinurlLink = function(){
        var pageOpen = window.open();
        traVal.auto_login_urlFn(function(res, status, headers, config) {
            if (res.code === 0) {
                pageOpen.location.href = res.result.auto_url;
                TDAPP.onEvent('商户端积分商城#点击次数');   
            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                };
            }
        }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                };
        });
    };

    //桌面通知按钮
    $scope.switchButton = notifyPermission();
    $scope.switchButtonFn = function(switchButton) {
        if(switchButton == 'denied'){
            alert('为了不影响你的抢单业务，请设置浏览器允许对此页面进行消息通知，如您不清楚如何操作，请尽快联系客服！');
            return;
        }
        desktopNotify("您的浏览器现在可以接收消息通知！");
        $scope.switchButton = 'granted';
    };

    //接收通知更新今日订单数字
    $scope.updateTodayBiddocNum = function(data) {
        $rootScope.$apply(function() {
            $rootScope.initordercenter.SumTodayPipeiBiddocs.sum += 1;
        });
    };

    //接收通知不在订单页面更新今日订单红点
    $scope.updateBiddocDotFn = function() {
        $scope.$apply(function(){
            $scope.noticeObj.updateBiddocDot = true;
        });
    };

    //接收通知不在历史交易页面更新红点
    $scope.updateHistoryDotFn = function() {
        $scope.$apply(function(){
            $scope.noticeObj.updateHistoryDot = true;
        });
    };

    //************操作函数*****************/

    //聊天头像点击对话
    $scope.chatChange = function(index, item, sendHelloFlag) {

        //清空发送输入框
        $scope.chart.chartInput = '';
        
        //获取当前选中对象
        $rootScope.chatItems.activeTab = item.biddoc_id;

        //获取标书ID biddoc_id
        var tData = {
            biddoc_id: item.biddoc_id
        };

        //如果有chat_code和place_id则不再请求
        if (item.chat_code) {
            //更新聊天窗口顶部买家信息
            $scope.updateCommuBiddocInfo(item);

            //更新聊天号
            curChatNum = item.chat_code;

            //缓存当前聊天信息
            $scope.curChat = curChat = traVal.curChat = item;

            //获取是否为下单状态
            $rootScope.placeOrderId = traVal.curChat.place_id;

            //记录当前聊天对象
            traVal.history_chatcode = curChatNum;

            //创建聊天窗口结构
            $scope.updateChatBody(item);
            $rootScope.chatItems[index].chat_code = curChatNum;
            $rootScope.chatItems[index].isPartner = item.isPartner;
            $rootScope.chatItems[index].biddoc_type = item.biddoc_type;

            // 聊天属性信息未初始化的会话设置聊天属性
            if (!curOrderChat[curChatNum]) {
                // 初始化会话数据
                curOrderChat[curChatNum] = {
                    chatNum: curChatNum,
                    unreadMsgCount: 0,
                    serialNum: 0,
                    hisSerialNum: 0,
                    lastTime: null,
                    curTime: null,
                    firstGetHistory: 1 // 首次获取历史消息标识
                };

                getChatProperty([curChatNum], true, sendHelloFlag);
                if (item.unreadMsgCount && item.unreadMsgCount != 0) {
                    //选择后清空历史聊天数字通知
                    $rootScope.chatItems[index].unreadMsgCount = 0;
                }
            } else {
                // 有消息通知的场合
                if (item.unreadMsgCount) {
                    // 请求未读消息
                    getUnreadMsg(traVal.curChat.chat_code);
                    //选择后清空历史聊天数字通知
                    $rootScope.chatItems[index].unreadMsgCount = 0;
                } else {
                    // 切换 tab 只请求一次历史记录
                    if (curOrderChat[curChatNum].firstGetHistory > 0) {
                        getHisMsg(curChatNum);
                    }
                }
            }
            $timeout(function () {
                initOrder();
                scrollToEnd();
                //图片放大旋转
                artZoom();
            }, 500);
            return;
        }

        //买家信息获取
        traVal.buyercommunicateFn(tData, function(res, status, headers, config) {

            //输出列表内容
            if (res.code == 0) {
                //更新聊天窗口顶部买家信息
                $scope.updateCommuBiddocInfo(res.result.commuBiddocInfo);

                //更新聊天号
                curChatNum = res.result.commuBiddocInfo.chat_code;

                //缓存当前聊天信息
                res.result.commuBiddocInfo.biddoc_type = item.biddoc_type;
                $scope.curChat = curChat = traVal.curChat = res.result.commuBiddocInfo;

                //获取是否为下单状态
                $rootScope.placeOrderId = traVal.curChat.place_id;

                //记录当前聊天对象
                traVal.history_chatcode = curChatNum;

                //创建聊天窗口结构
                $scope.updateChatBody(res.result.commuBiddocInfo);
                $rootScope.chatItems[index].chat_code = curChatNum;
                $rootScope.chatItems[index].isPartner = item.isPartner;
                $rootScope.chatItems[index].biddoc_type = item.biddoc_type;

                // 聊天属性信息未初始化的会话设置聊天属性
                if (!curOrderChat[curChatNum]) {
                    // 初始化会话数据
                    curOrderChat[curChatNum] = {
                        chatNum: curChatNum,
                        unreadMsgCount: 0,
                        serialNum: 0,
                        hisSerialNum: 0,
                        lastTime: null,
                        curTime: null,
                        firstGetHistory: 1 // 首次获取历史消息标识
                    };

                    getChatProperty([curChatNum], true);
                    if (item.unreadMsgCount && item.unreadMsgCount != 0) {
                        //选择后清空历史聊天数字通知
                        $rootScope.chatItems[index].unreadMsgCount = 0;
                    }
                } else {
                    // 有消息通知的场合
                    if (item.unreadMsgCount && item.unreadMsgCount != 0) {

                        // 请求未读消息
                        getUnreadMsg(traVal.curChat.chat_code);
                        //选择后清空历史聊天数字通知
                        $rootScope.chatItems[index].unreadMsgCount = 0;

                    } else {
                        // 切换 tab 只请求一次历史记录
                        if (curOrderChat[curChatNum].firstGetHistory > 0) {
                            getHisMsg(curChatNum);
                        }
                    }
                }
                $timeout(function() {
                    initOrder();
                    scrollToEnd();
                    //图片放大旋转
                    artZoom();
                }, 500)

            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                }
            }

        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(),
                isOpen:true
            }
        })


    }


    //更新聊天窗口顶部买家信息
    $scope.updateCommuBiddocInfo = function(commuBiddocInfo) {
        $scope.noticeObj.commuBiddocInfo = commuBiddocInfo;     
       
        //设置显示的聊天窗口
        $scope.activeTab = commuBiddocInfo.chat_code;

        $timeout(function() {
            //订单页面初始化调用
            initOrder();
        });
    };   

    //聊天窗口初始化
    $scope.chatBody = [];
    //生成聊天窗口
    $scope.updateChatBody = function(chatNumObj) {

        //相同聊天号只生成一次聊天窗口
        if (indexOf($scope.chatBody, chatNumObj.chat_code) == -1) {
            $timeout(function() {
                $scope.chatBody.push(chatNumObj);

                //创建聊天窗口系统通知
                $scope.msgInfo['chatNotice_' + chatNumObj.chat_code] = true;

                //订单页面初始化调用
                initOrder();
                scrollToEnd();
            });
        }

    };

    //聊天内容初始化
    $scope.msgInfo = {};
    $scope.historyisShow = {};
    $scope.historyImgisShow = {};

    //生成聊天内容
    $scope.updateMsgInfo = function(txtObj) {

        //生成显示发送的消息
        if (!txtObj.chatNum) {
            if (!$scope.msgInfo['chat_' + curChatNum]) {
                $scope.msgInfo['chat_' + curChatNum] = [];
            }
            //将发送的信息显示到页面
            $scope.msgInfo['chat_' + curChatNum].unshift(txtObj);

        } else {
            //生成显示历史消息
            if (!$scope.msgInfo['chat_' + curChatNum]) {
                $scope.msgInfo['chat_' + curChatNum] = [];
                $scope.msgInfo['chat_' + txtObj.chatNum] = txtObj.arrHisMsg;
            }else if($scope.msgInfo['chat_' + curChatNum].length >0){
                //点击查看更多历史消息
                $scope.msgInfo['chat_' + txtObj.chatNum] = $scope.msgInfo['chat_' + txtObj.chatNum].concat(txtObj.arrHisMsg);
            }

        }

        $timeout(function() {
            //订单页面初始化调用
            initOrder();
            scrollToEnd();
        })


    }

    // *********************** 发送聊天窗口 ***********************//

    //控制回车发送及ctrl+enter换行
    $scope.chart = {};
    $scope.chartKeydown = function(event, hello) {
        if (event.ctrlKey && event.keyCode === 13) {
            $scope.chart.chartInput = $scope.chart.chartInput + '\n';
        }

        if (event.keyCode === 13 && (!event.ctrlKey)) {
            event.preventDefault();
            $scope.chartTextSend();
        }
    }

    // 点击发送按钮
    $scope.chartTextSend = function(hello) {
        if (!curChatNum) return;

        var textContent;
        if (hello) {
            textContent = hello;
        } else {
            textContent = removeHTMLTag($scope.chart.chartInput.toString().trim());
            if (textContent.length == 0) {
                return;
            }
        }

        //获取150字
        var txtMsgSend = textContent.substr(0, 150);

        // 加入换行
        txtMsgSend = txtMsgSend.replace(/\n/g, '<br/>');
        var txtObj = { serialNum: getNextSerialNum(curChatNum), msgBody: txtMsgSend, fromTo: fromTo };

        // 发送文字消息
        //判断是专线沟通还是抢单聊天
        if(traVal.topChatBar.activeTab == 'ironChat' ){
            sendMsg(txtMsgSend, txtMsgType, traVal.curChat, undefined, 'biddoc');
        }else if(traVal.topChatBar.activeTab == 'customerLine'){
            sendMsg(txtMsgSend, txtMsgType, traVal.curCustomerLine, undefined, 'conversation');
        }
        

        // 显示消息
        showTxtMsg(txtObj, curChatNum);

        // 超过150个字符保留在输入框中
        if (textContent.length > 150) {
            var txtMsgSave = textContent.substr(150);
            $scope.chart.chartInput = txtMsgSave;
        } else {
            // 清空输入框
            $timeout(function(){
                $scope.chart.chartInput = '';
            })
        }

        //滚动消息到底部
        $timeout(function() {
            scrollToEnd();
        })

    }

    // 上传文件的同时读取文件
    $scope.sendImg = function(files) {

        var ieFlag = (navigator.appVersion.indexOf("MSIE") != -1); // IE
        var fileInput = document.getElementById("file_input");
        var file = files[0];
        if (!/image\/\w+/.test(file.type)) {
            alert("只支持jpeg、png、bitmap格式的图片！");
            return false;
        }

        lrz(file, {
            width: 1500,
            height: 1500,
            quality: 0.3
        }).then(function (rst) {
            $timeout(function () {
                var picObj = {serialNum: getNextSerialNum(curChatNum), msgBody: rst.base64, fromTo: fromTo};

                // 发送图片消息
                if(traVal.topChatBar.activeTab == 'ironChat' ){
                    sendMsg(rst.base64, picMsgType, traVal.curChat, undefined, 'biddoc');
                }else if(traVal.topChatBar.activeTab == 'customerLine'){
                    sendMsg(rst.base64, picMsgType, traVal.curCustomerLine, undefined, 'conversation');
                }

                // 显示图片
                showPicMsg(picObj, curChatNum);

                if (ieFlag) {
                    // 清除文件
                    fileInput.select();
                    document.execCommand("delete");
                } else {
                    fileInput.value = "";
                }
                rst = null;
            });
        }).catch(function (err) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText: '对不起，图片太大，加载失败，请重试！',
                isOpen: true
            }
        });

    };

    //查看未读消息&查看历史消息
    $scope.historyChange = function(event) {
        event.stopPropagation();
        // 获取历史消息
        getHisMsg(curChatNum);
    };

    //抢单成功建立一个聊天
    $scope.updateChatItems = function(commuBiddocInfo) {

        //更新聊天头像
        $rootScope.chatItems.unshift(commuBiddocInfo);

        //默认显示第一个聊天窗口并发送问候语
        $scope.chatChange(0, $rootScope.chatItems[0], true);

    }

    //聊天头像关闭操作
    $scope.removeChatAvatar = function(index, $event) {

        $event.stopPropagation();

        var item = $rootScope.chatItems[index];

        //获取标书ID biddoc_id
        var tData = {
            biddoc_id: $rootScope.chatItems[index].biddoc_id
        };

        //关闭聊天窗口请求
        traVal.close_chatFn(tData, function(res, status, headers, config) {

            //输出列表内容
            if (res.code == 0) {
                console.log("close_chatFn", res);

                //删除当前头像
                $rootScope.chatItems.splice($rootScope.chatItems.indexOf(item), 1);

                //删除聊天窗体
                $scope.chatBody.splice($scope.chatBody.indexOf($scope.chatBody[index]), 1);

                //删除聊天对话
                $scope.msgInfo['chat_' + item.chat_code] = null;

                //删除顶部窗体信息
                $scope.noticeObj.commuBiddocInfo = null;

                //删除获取的聊天号
                delete curOrderChat[item.chat_code];
                delete traVal.history_chatcode;

                //默认显示第一个聊天窗口
                if ($rootScope.chatItems.length > 0) {
                    $scope.chatChange(0, $rootScope.chatItems[0]);
                }

            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                }
            }

        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(),
                isOpen:true
            }
        })

    };


    //更新当前触发聊天信息
    $scope.updateChatAvatar = function(item) {
        
        var list,
            change,
            id;
        //判断是触发抢单聊天还是专线沟通
        if (item.biddoc_id) {
            traVal.topChatBar.activeTab = 'ironChat';
        }else{
            traVal.topChatBar.activeTab = 'customerLine';
        }

        //判断是专线沟通还是抢单聊天
        if(traVal.topChatBar.activeTab == 'ironChat'){
            list = $rootScope.chatItems;
            change = $scope.chatChange;
            id = 'biddoc_id';
        }else if(traVal.topChatBar.activeTab == 'customerLine' && !item.biddoc_id){
            list = angular.element(orderMain).scope().CustomerLineList;
            change = angular.element(orderMain).scope().customerLineChange;
            id = 'chat_code';
        }

        if (list.length !== 0) {
            var res = indexOfChatcode(list, item[id], id);
            if (res == -1) {
                list.unshift(item);
                change(0, list[0]);
            } else {
                change(res, list[res]);
            }
        } else {
            list.unshift(item);
            change(0, list[0]);
        }
    };

    //******************** 聊天结束 ******************** //


}]);

//我的订单主页
app.controller('orderCtr', ['$rootScope', '$scope', '$state', '$timeout', '$interval', 'traVal', function($rootScope, $scope, $state, $timeout, $interval, traVal) {
    //模态框调用初始化(必须设置)
    $scope.msAlertModalConfig = {};

    //触发从历史订单过来的聊天
    $timeout(function(){
        if (traVal.history_chatcode) {
            //获取聊天号 chat_code
            var tData = {
                chat_code: traVal.history_chatcode
            };

            //通过chat_code建立聊天
            traVal.communicate_by_chatcodeFn(tData, function(res, status, headers, config) {

                //输出列表内容
                if (res.code == 0) {
                    console.log("communicate_by_chatcode", res);

                    //更新聊天头像
                    angular.element(orderMain).scope().updateChatAvatar(res.result.commuBiddocInfo);

                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    }
                }

            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                }
            })
        }
    },500)

    //聊天头像列表数据
    if (!$rootScope.chatItems) {
      $rootScope.chatItems = [];
    }
    //聊天头像设置是否还有新数据状态
    $scope.dataChatState = true;
    //聊天分页初始位置设置
    traVal.chatPage = 0;

    var arrChatNum = [];

    //聊天头像滚动分页读取
    $scope.loadChatMore = function(page) {
        if ($rootScope.chatItems.length > 0 && !page) return;

        if ($scope.dataChatState) {
            traVal.commuBiddocsFn(function(res, status, headers, config) {
                    //输出列表内容
                if (res.code == 0) {

                    //创建聊天头像
                    if (res.result.commuBiddocs.length != 0) {
                        //订单列表详情数据分页
                        for (var i = 0; i < res.result.commuBiddocs.length; i++) {
                            //构建数据
                            if (!res.result.commuBiddocs[i].unreadMsgCount) {
                               res.result.commuBiddocs[i].unreadMsgCount = 0;
                            }
                            $rootScope.chatItems.push(res.result.commuBiddocs[i]);

                            // 初始化会话数据
                            curOrderChat[res.result.commuBiddocs[i].chat_code] = {
                                chatNum: res.result.commuBiddocs[i].chat_code,
                                unreadMsgCount: 0,
                                serialNum: 0,
                                hisSerialNum: 0,
                                lastTime: null,
                                curTime: null,
                                firstGetHistory: 1 // 首次获取历史消息标识
                            };
                            arrChatNum.push(res.result.commuBiddocs[i].chat_code);
                        }

                        traVal.chatPage++;
                        $scope.chatPageTip = "";
                    }

                    if (res.result.commuBiddocs.length < 20 && traVal.chatPage != 1) {
                        $scope.dataChatState = !$scope.dataChatState;
                        $scope.chatPageTip = "已经没有更多数据";
                    }

                    initChat();
                } else {
                    //错误信息
                    $scope.chatPageTip = errCode();
                }
            }, function(res, status, headers, config) {
                //错误信息
                $scope.chatPageTip = errCode();
            })
        }
    };

    $scope.loadChatMore();

    //设置背景色
    $rootScope.isBgcolor = false;

    //初始化数据加载完毕，载入待处理订单
    var loadWatch = $scope.$watch('loadingEnd', function(newVal, oldVal) {
        if (newVal) {

            //待处理订单参数
            traVal.tData = {
                "seller_id": localLoadJsonStorage("seller_id"),
                "pagestart": 0,
                "perpage": 20
            }
            //触发待处理订单
            if ($state.current.name == 'order') {
                angular.element(tab_pendOrder).scope().loadProcessOrdersMore('update');
            }

            //页面控件初始化
            initOrder();

            //移除$watch
            loadWatch();
        }
    });


    //新的订单详情滚动条美化渲染
    initScrollOrder("#orderInfo_ccj .partList");

    //订单顶部tab控制
    var myOrders = $scope.myOrders = {};
    $scope.myOrdersFn = function(el) {
        myOrders.activeTab = el;
    };

    //聊天头像顶部导航tab控制
    var topChatBar = traVal.topChatBar = $scope.topChatBar = {};
    $scope.topChatBarFn = function(el) {
        topChatBar.activeTab = el;
        var index;
        if (el == 'customerLine') {
            //消除小红点
            $scope.noticeObj.updateCustomerLineDot = false;
            //加载专线沟通列表
            $scope.loadCustomerLineMore(0);
            //有聊天信息切换专线沟通
            if(traVal.curCustomerLine){
                index = indexOfChatcode($scope.CustomerLineList, traVal.curCustomerLine.chat_code, 'chat_code');
                $scope.customerLineChange(index,traVal.curCustomerLine);
            }
            $timeout(function() {
                fixHeight();
                initScroll("#ChatAvatar .customerLineList");
            });
        }else if(el == 'ironChat'){
            //消除小红点
            $scope.noticeObj.updateIronChatDot = false;
            //有聊天信息切换抢单聊天
            if(traVal.curChat){
                index = indexOfChatcode($rootScope.chatItems, traVal.curChat.biddoc_id, 'biddoc_id');
                $scope.chatChange(index, traVal.curChat);
            }
        }
    };
    
    /****************** 专线沟通 begin ******************/

    //专线沟通头像列表数据
    if (!$scope.CustomerLineList) {
      $scope.CustomerLineList = [];
    }
    //专线沟通头像设置是否还有新数据状态
    var dataCustomerLineState = true;

    //分页页数
    var CustomerLinePage = 0;

    var arrCustomerLineNum = [];

    //专线沟通头像滚动分页读取
    $scope.loadCustomerLineMore = function(page) {
        if ($scope.CustomerLineList.length > 0 && !page) return;

        var tData = {
            user_id:$rootScope.initordercenter.curUserId,
            page:CustomerLinePage,
            perpage:20
        };

        if (dataCustomerLineState) {
            traVal.special_chat_listFn(tData, function(res, status, headers, config) {
                //输出列表内容
                if (res.code === 0) {

                    //创建聊天头像
                    if (res.result.length !== 0) {
                        
                        //订单列表详情数据分页
                        for (var i = 0; i < res.result.length; i++) {
                            res.result[i].unreadMsgCount = parseInt(res.result[i].unread_count);
                            res.result[i].buyer_id = res.result[i].user_id;
                            $scope.CustomerLineList.push(res.result[i]);                       
                        }

                        CustomerLinePage++;
                        $scope.CustomerLineTip = "";
                    }

                    if ($scope.CustomerLineList.length < 20 && CustomerLinePage != 1) {
                        dataCustomerLineState = !dataCustomerLineState;
                        $scope.CustomerLineTip = "已经没有更多数据";
                    }

                    initChat();
                } else {
                    //错误信息
                    $scope.CustomerLineTip = errCode();
                }
            }, function(res, status, headers, config) {
                //错误信息
                $scope.CustomerLineTip = errCode();
            });
        }
    };

    //专线沟通头像点击
    $scope.customerLineChange = function (index, item, sendHelloFlag) { 
        //清空发送输入框
        $scope.chart.chartInput = '';

        //获取当前选中对象
        $scope.CustomerLineList.activeTab = item.chat_code;

        //获取专线沟通买家详情
        traVal.buyerAccountId = item.buyer_id;
        traVal.buyerChatCode = item.chat_code;
        traVal.special_buyer_infoFn(function(res, status, headers, config) {
            //输出列表内容
            if (res.code === 0) {
                //判断是否为待处理订单跳转过来
                if (!item.account_head_photo) {
                    $.extend($scope.CustomerLineList[index], res.result);
                    $scope.CustomerLineList[index].place_id = $scope.CustomerLineList[index].purchase_order_id;
                }

                //缓存当前专线沟通信息
                $scope.curCustomerLine = curChat = traVal.curCustomerLine = $.extend(res.result, item);

                //更新专线沟通顶部买家信息
                $scope.updateCommuBiddocInfo(traVal.curCustomerLine);

                //更新聊天号
                curChatNum = traVal.curCustomerLine.chat_code;

                //记录当前聊天对象
                traVal.history_chatcode = curChatNum;

                //创建聊天窗口结构
                $scope.updateChatBody(traVal.curCustomerLine);

                //获取是否为下单状态
                $rootScope.placeOrderId = traVal.curCustomerLine.place_id;


                // 聊天属性信息未初始化的会话设置聊天属性
                if (!curOrderChat[curChatNum]) {
                    // 初始化会话数据
                    curOrderChat[curChatNum] = {
                        chatNum: curChatNum,
                        unreadMsgCount: 0,
                        serialNum: 0,
                        hisSerialNum: 0,
                        lastTime: null,
                        curTime: null,
                        firstGetHistory: 1 // 首次获取历史消息标识
                    };

                    getChatProperty([curChatNum], true, sendHelloFlag);
                    if (item.unreadMsgCount && item.unreadMsgCount !== 0) {
                        //选择后清空历史聊天数字通知
                        $scope.CustomerLineList[index].unreadMsgCount = 0;
                    }
                } else {
                    // 有消息通知的场合
                    if (item.unreadMsgCount) {
                        // 请求未读消息
                        getUnreadMsg(traVal.curCustomerLine.chat_code);
                        //选择后清空历史聊天数字通知
                        $scope.CustomerLineList[index].unreadMsgCount = 0;
                    } else {
                        // 切换 tab 只请求一次历史记录
                        if (curOrderChat[curChatNum].firstGetHistory > 0) {
                            getHisMsg(curChatNum);
                        }
                    }
                }

                $timeout(function () {
                    initOrder();
                    scrollToEnd();
                    //图片放大旋转
                    artZoom();
                }, 500);

            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                };
            }
        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(res.code),
                isOpen:true
            };
        });

    };

    //删除专线沟通会话
    $scope.removeCustomerLine = function(index, $event) {
        $event.stopPropagation();
        //设置交易密码模态框调用
        $scope.msAlertModalConfig = {
            contentText: '<p class="font16 text-center">目前暂不支持删除后找回对方</p><p class="font16 text-center">该功能将会在短期升级更新</p>',
            sureText: '继续删除', //确定按钮
            cancelText: '取消', //驳回按钮
            cancelConfig: true, //是否包含取消按钮
            backdrop: true, //设置是否可点击背景关闭
            sizeConfig: 'sm',
            isOpen: true
        };
        $scope.alertmodelOk = function() {
            $scope.removeCustomerLineOk();
        };
        //确定聊天窗口请求
        $scope.removeCustomerLineOk = function(){
            var item = $scope.CustomerLineList[index];
            //获取chat_code
            var tData = {
                chat_code: item.chat_code
            };
            traVal.close_special_chatFn(tData, function(res, status, headers, config) {

                //输出列表内容
                if (res.code === 0) {

                    //删除当前头像
                    $scope.CustomerLineList.splice($scope.CustomerLineList.indexOf(item), 1);

                    //删除聊天窗体
                    $scope.chatBody.splice($scope.chatBody.indexOf($scope.chatBody[index]), 1);

                    //删除聊天对话
                    delete $scope.msgInfo['chat_' + item.chat_code];
                    $scope.curCustomerLine = curChat = traVal.curCustomerLine = null;

                    //删除顶部窗体信息
                    $scope.noticeObj.commuBiddocInfo = null;

                    //删除获取的聊天号
                    delete curOrderChat[item.chat_code];
                    delete traVal.history_chatcode;

                    //默认显示第一个聊天窗口
                    if ($scope.CustomerLineList.length > 0) {
                        $scope.customerLineChange(0, $scope.CustomerLineList[0]);
                    }

                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    };
                }

                $scope.msAlertModalConfig.isOpen = false;

            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                };
            });
        };


    };


    /******** 专线沟通 end ********/


    //待处理订单模态框
    $scope.biddocInfoModalFn = function(biddoc_id) {
        //传入参数
        traVal.biddoc_id = biddoc_id;
        traVal.biddocInfoFn(function(res, status, headers, config) {
            console.log("biddocInfoModal", res)
                //输出列表内容
            if (res.code == 0) {
                $scope.biddocInfo = res.result.biddocInfo;
                $scope.buyerCompanyInfo = res.result.buyerCompanyInfo;
                $timeout(function(){
                    initScroll("#orderInfoTop .partList");
                });
            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                };
            }

        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(),
                isOpen:true
            };
        });
    };

    //聊天窗口下单生成订单
    $scope.placeOrderModel = function() {
        TDAPP.onEvent( '点击给对方下单次数');
        //判断是专线沟通还是抢单聊天
        if(traVal.topChatBar.activeTab == 'ironChat' ){
            //判断是否为未生成的订单
            if (traVal.curChat.place_id === null) {
                //传入参数,请求标书详情
                traVal.biddoc_id = traVal.curChat.biddoc_id;
                traVal.biddocInfoFn(function(res, status, headers, config) {
                    //输出列表内容
                    if (res.code == 0) {
                        $scope.biddocInfo = res.result.biddocInfo;
                        $scope.buyerCompanyInfo = res.result.buyerCompanyInfo;

                        //合并标书详情及待处理订单详情
                        $scope.pendOrderData = $.extend({}, $scope.biddocInfo, traVal.curChat,$scope.buyerCompanyInfo);
                        $scope.pendOrderData.logistics_type = 'pick_up';

                        //配件操作
                        partEdit($scope.pendOrderData, $scope.pendOrderData.parts, 'pendOrderData.parts');

                    }else{
                        //错误信息
                        $rootScope.errAlertModalConstant = {
                            contentText:errCode(res.code),
                            isOpen:true
                        }
                    }

                }, function(res, status, headers, config) {
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    };
                });
            }
        }else if(traVal.topChatBar.activeTab == 'customerLine'){
            //根据account_id获取账号信息
            traVal.buyers_account_id = traVal.curCustomerLine.buyer_id;
            traVal.accountFn(function(res, status, headers, config) {
                //输出列表内容
                if (res.code === 0) {
                    console.log(res);
                    $scope.pendOrderData = res.result;
                    $scope.pendOrderData.logistics_type = 'pick_up';
                    $scope.pendOrderData.chat_code = traVal.curCustomerLine.chat_code;
                    $scope.pendOrderData.parts = [];
                    partEdit($scope.pendOrderData, $scope.pendOrderData.parts, 'pendOrderData.parts');
                    //转换经营品牌为数组
                    $scope.pendOrderData.model = [];
                    var scope_sub_arr = [];
                    scope_sub_arr = $rootScope.initordercenter.companyInfo.scope_sub_str.split(",");
                    //获取经营品牌
                    traVal.modelFn(function(res, status, headers, config) {
                        
                        if ($rootScope.initordercenter.companyInfo.scope_brand_factory == 1) {
                            //获取经营品牌
                            angular.forEach(res, function(value, key) {
                                for (var i = 0; i < scope_sub_arr.length; i++) {
                                    if (scope_sub_arr[i] == value.id) {
                                        $scope.pendOrderData.model.push(value);
                                    }
                                }
                            });
                        }else{
                            //获取经营主机厂
                            angular.forEach(res, function(value, key) {
                                angular.forEach(value.factorys, function(v, k) {
                                    for (var i = 0; i < scope_sub_arr.length; i++) {
                                        if (scope_sub_arr[i] == v.id) {
                                            $scope.pendOrderData.model.push(v);
                                        }
                                    }
                                });
                            });
                        }

                        //合并主机厂信息给卖家下单选择
                        $scope.pendOrderData.modelArr = [];
                        angular.forEach($scope.pendOrderData.model, function(value, key) {
                            for (var n = 0; n < value.list.length; n++) {
                                $scope.pendOrderData.modelArr.push(value.list[n]);
                                value.list[n].brandName = value.name;
                                value.list[n].brandId = value.id;
                            }
                        });
                    }, function(res, status, headers, config) {
                        console.log("经营范围文件加载失败");
                    });

                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    };
                }

            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                };
            });
        }



        //生成订单配件操作
        function partEdit(orderInfo, partData, partWatch) {
            //删除待处理订单模态框配件
            $scope.partsRemove = function(index) {
                var item = partData[index];
                partData.splice(partData.indexOf(item), 1);
            };

            //增加待处理订单模态框配件
            $scope.partsAdd = function() {

                var partid = 'C0' + partData.length;
                var part = {
                    "part_id": partid,
                    "part_name": "",
                    "part_brand_type": "",
                    "part_brand_name": "",
                    "unit_price": "",
                    "number": "",
                    "subtotal": "",
                    "remark": ""
                };
                partData.push(part);
            };

            //监听选择配件数据变化获取总价
            $scope.$watch(partWatch, function(newVal, oldVal) {
                if (newVal == oldVal) {
                    return;
                }

                //赋值总价
                orderInfo.order_money = 0;

                //获取价格
                angular.forEach(partData, function(value, key) {
                    if (value.number && value.unit_price) {
                        orderInfo.order_money = Math.formatFloat(orderInfo.order_money + (value.number * value.unit_price), 2);
                    }
                });

            }, true);
        }

    };

    //生成订单接口
    $scope.neworderChange = function() {

        //新订单生成
            if ($scope.pendOrderData.logistics_money) {
                $scope.pendOrderData.total_money = $scope.pendOrderData.order_money + $scope.pendOrderData.logistics_money;
            } else {
                $scope.pendOrderData.total_money = $scope.pendOrderData.order_money;
                $scope.pendOrderData.logistics_money = 0;
            }

            var tData = {
                "place_id": $scope.pendOrderData.place_id,
                "biddoc_type": $scope.pendOrderData.biddoc_type,
                "order_type": 1,
                "status_flag": "CREATE",
                "bid_id": $scope.pendOrderData.bid_id,
                "biddoc_id": $scope.pendOrderData.biddoc_id,
                "biddoc_note": $scope.pendOrderData.biddoc_note,
                "scope_id": $scope.pendOrderData.scope_id,
                "scope_name": $scope.pendOrderData.scope_name,
                "factory_id": $scope.pendOrderData.factory_id || $scope.pendOrderData.model_vm.brandId,
                "factory_name": $scope.pendOrderData.factory_name || $scope.pendOrderData.model_vm.brandName,
                "model_id": $scope.pendOrderData.model_id || $scope.pendOrderData.model_vm.id,
                "model_name": $scope.pendOrderData.model_name || $scope.pendOrderData.model_vm.name,
                "vin": $scope.pendOrderData.VIN,
                "chat_code": $scope.pendOrderData.chat_code,
                "buyer_company_id": $scope.pendOrderData.buyer_company_id,
                "buyer_company_name": $scope.pendOrderData.buyer_company_name,
                "buyer_id": $scope.pendOrderData.buyer_id,
                "buyer_contact_tel": $scope.pendOrderData.contactTel,
                "buyer_contact_name": $scope.pendOrderData.buyer_fullName,
                "buyer_company_provience": $scope.pendOrderData.org_province_name,
                "buyer_company_city": $scope.pendOrderData.org_city_name,
                "buyer_company_county": $scope.pendOrderData.org_county_name,
                "buyer_company_address": $scope.pendOrderData.org_address,
                "seller_contact_tel": $rootScope.initordercenter.companyInfo.org_contact_tel,
                "seller_contact_name": $rootScope.initordercenter.companyInfo.org_contact,
                "seller_company_provience": $rootScope.initordercenter.companyInfo.org_province_name,
                "seller_company_city": $rootScope.initordercenter.companyInfo.org_city_name,
                "seller_company_county": $rootScope.initordercenter.companyInfo.org_county_name,
                "seller_company_address": $rootScope.initordercenter.companyInfo.org_address,
                "logistics_type": $scope.pendOrderData.logistics_type || '',
                "logistics_name": $scope.pendOrderData.logistics_name,
                "logistics_money": $scope.pendOrderData.logistics_money,
                "order_money": $scope.pendOrderData.order_money,
                "total_money": $scope.pendOrderData.total_money,
                "parts": JSON.stringify($scope.pendOrderData.parts)
            };

            traVal.neworderFn(tData, function(res, status, headers, config) {

                if (res.code === 0) {

                    //判断是专线沟通还是抢单聊天
                    var list,
                        cur_chat,
                        msg_by;
                    if(traVal.topChatBar.activeTab == 'ironChat' ){
                        list = $rootScope.chatItems;
                        cur_chat = traVal.curChat;
                        msg_by = 'biddoc';
                    }else if(traVal.topChatBar.activeTab == 'customerLine'){
                        list = $scope.CustomerLineList;
                        cur_chat = traVal.curCustomerLine;
                        msg_by = 'conversation';
                    }

                    //更新待处理订单状态
                    angular.element(tab_pendOrder).scope().loadProcessOrdersMore('update');

                    //禁用下单按钮
                    angular.forEach(list, function(value, key){
                        if (value.chat_code == $scope.pendOrderData.chat_code) {
                            list[key].place_id = 0;
                        }
                    });
                    $rootScope.placeOrderId = true;

                    // TODO: 构造订单消息
                    var orderMsg = {
                        type: 'ORDER',
                        body: {
                            orderId: res.result.purchase_order_id,
                            orderType: 1,
                            brandLogo: $scope.pendOrderData.brand_logo_url || $scope.pendOrderData.model_vm.brandId,
                            parts: [],
                            total: $scope.pendOrderData.total_money
                        }
                    };
                    //构造订单消息配件数据
                    angular.forEach($scope.pendOrderData.parts, function(value, key){
                        orderMsg.body.parts.push({name:value.part_name, count:value.number});
                    });

                    var jsonOrderMsg = JSON.stringify(orderMsg);
                    // 发送一条订单通知
                    sendMsg(jsonOrderMsg, jsonMsgType, cur_chat, visibleBuyer, msg_by);

                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    };
                }
            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                };
            });


    };

    //------------------------------------------------------------------------------------------------------------------
    function initChat() {
        if ($rootScope.initordercenter) {
            initChatSocket($rootScope.initordercenter.curUserId, chatProtoHandler);
        } else {
            // account_id 监听
            var userIdWatcher = $scope.$watch('initordercenter', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    initChatSocket(newVal.curUserId, chatProtoHandler);
                    userIdWatcher();
                }
            });
        }
    }

    function chatProtoHandler(protocolName, recProto) {
        switch (protocolName) {
            case chatProtoName.proto_down_chat_property:
                handlerChatProperty(recProto);
                break;
            case chatProtoName.proto_down_unreadmsg:
                handlerUnreadMsg(recProto);
                break;
            case chatProtoName.proto_down_readmsg:
                handlerReadMsgNotice(recProto);
                break;
            case chatProtoName.proto_down_rep_msg:
                handlerMsgResponse(recProto);
                break;
            case chatProtoName.proto_down_notice:
                handlerNewMsgNotice(recProto);
                break;
            case chatProtoName.proto_down_hismsg:
                handlerHistoryMsg(recProto);
                break;
            default:
                if (arrChatNum.length) {
                    // 请求会话属性
                    getChatProperty(arrChatNum);
                }
                break;
        }
    }

    function handlerChatProperty(recProto) {
        //判断是专线沟通还是抢单聊天
        var list;
        if(traVal.topChatBar.activeTab == 'ironChat' ){
            list = $rootScope.chatItems;
        }else if(traVal.topChatBar.activeTab == 'customerLine'){
            list = $scope.CustomerLineList;
        }

        // 初始页面场合
        for (var i = 0, l = recProto.chatProperty.length; i < l; i++) {
            var chatProperty = recProto.chatProperty[i];
            curOrderChat[chatProperty.chatNum].chatNum = chatProperty.chatNum;
            curOrderChat[chatProperty.chatNum].unreadMsgCount = chatProperty.unreadCount;
            curOrderChat[chatProperty.chatNum].serialNum = chatProperty.serialNum;
            curOrderChat[chatProperty.chatNum].hisSerialNum = chatProperty.serialNum;

            // 更新未读消息数量
            for (var j = 0, ll = list.length; j < ll; j++) {
                if (list[j].chat_code === chatProperty.chatNum) {
                    list[j].unreadMsgCount = chatProperty.unreadCount;
                }
            }
        }

        // 发送一条问候消息
        if (recProto.sendHelloFlag) {
            $scope.chartTextSend("您好！很高兴为您服务！");
        }

        // 获取未读消息
        if (recProto.getUnreadMsgFlag) {
            // 有消息通知的场合
            if (chatProperty.unreadCount) {
                // 请求未读消息
                getUnreadMsg(chatProperty.chatNum);
                // 选择后清空历史聊天数字通知
                for (var k in list) {
                    if (list[k].chat_code == chatProperty.chatNum) {
                        list[k].unreadMsgCount = 0;
                        break;
                    }
                }
            } else {
                // 切换 tab 只请求一次历史记录
                if (curOrderChat[chatProperty.chatNum].firstGetHistory > 0) {
                    getHisMsg(chatProperty.chatNum);
                }
            }
        }
    }

    function handlerUnreadMsg(recProto) {
        // 接收未读消息应答
        var length = recProto.unreadMsgArray.length;
        if (length > 0) {
            var arrMsgId = [];
            for (var i = 0; i < length; i++) {
                recProto.unreadMsgArray[i].serialNum = getNextSerialNum(curChatNum);
                arrMsgId.push({
                    msgId: recProto.unreadMsgArray[i].msgId,
                    serialNum: recProto.unreadMsgArray[i].serialNum
                });
            }
            // 未读消息应答
            //判断是专线沟通还是抢单聊天
            if(traVal.topChatBar.activeTab == 'ironChat' ){
                unreadMsgResponse(traVal.curChat, arrMsgId);
            }else if(traVal.topChatBar.activeTab == 'customerLine'){
                unreadMsgResponse(traVal.curCustomerLine, arrMsgId);
            }
            
            // 显示最新未读消息
            showUnreadMsg(recProto);
            // 更新查看历史信息按钮状态
            hisMsg(recProto);
        } else {
            // 只获取一次
            if (curOrderChat[curChatNum].firstGetHistory > 0) {
                getHisMsg(curChatNum);
            }
        }
    }
    
    function handlerReadMsgNotice(recProto) {
        var arrMsg = $scope.msgInfo['chat_' + recProto.chatNum];
        if (!arrMsg) return;
        $timeout(function () {
            for (var k in recProto.arrMsgId) {
                for (var i = arrMsg.length - 1; i > -1; --i) {
                    if (recProto.arrMsgId[k].msgId == arrMsg[i].msgId) {
                        arrMsg[i].msgStatus = 2;
                    }
                }
            }
        });
    }

    function handlerMsgResponse(recProto) {
        // 取消发送状态图标
        $timeout(function () {
            hideSendStateMsg(recProto, $scope.msgInfo['chat_' + recProto.chatNum]);
        });
        scrollToEnd();
    }

    function handlerNewMsgNotice(recProto) {
        if (window.location.hash != '#/order') {
            var icon = "resource/img/msg_notify_icon.jpg";
            desktopNotify("亲，买家给您答复啦，赶紧搞定TA！", icon);
            showNotice(recProto);
            return;
        }

        // 如果用户不在当前标签页或者最小化页面时，弹出桌面提示框
        isNotified();

        //判断是专线沟通还是抢单聊天
        var list;
        if(traVal.topChatBar.activeTab == 'ironChat' ){
            list = $rootScope.chatItems;
        }else if(traVal.topChatBar.activeTab == 'customerLine'){
            list = $scope.CustomerLineList;
        }

        // 判断是否打开聊天窗口
        var chat_code = (traVal.curChat || traVal.curCustomerLine) ? curChatNum : '';
        if (isCurChatWindow(recProto, list, chat_code)) {
            // 请求未读消息
            getUnreadMsg(chat_code);
            // 订单页面初始化调用
            initOrder();
            scrollToEnd();
        } else {
            // 显示新消息通知提示
            showNotice(recProto);
        }
    }

    function handlerHistoryMsg(recProto) {
        // 显示历史消息
        showHisMsg(recProto);
        // 更新查看历史信息按钮状态
        hisMsg(recProto);
    }
    //------------------------------------------------------------------------------------------------------------------

    // 有历史消息未显示的场合
    function hisMsg(recProto) {

        if (recProto.hasHisMsg) {
            //显示查看历史消息按钮
            $scope.historyisShow['chat_' + curChatNum] = 'historyMsg';
            $scope.historyImgisShow['chat_' + curChatNum] = '';
        } else {
            //隐藏查看历史消息按钮
            $scope.historyisShow['chat_' + curChatNum] = 'hasNoneMsg';
            $scope.historyImgisShow['chat_' + curChatNum] = '';
        }

    }

    //不在当前窗口显示新消息提示
    function showNotice(recProto) {

        //判断当前通知是专线沟通还是抢单聊天
        if(recProto.msgBy == "conversation"){
            list = $scope.CustomerLineList;
        }else if(recProto.msgBy == "biddoc"){
            list = $rootScope.chatItems;
        }

        //判断当前聊天窗口增加新消息通知小红点
        if(traVal.topChatBar.activeTab == 'ironChat' && recProto.msgBy == "conversation"){
            $scope.noticeObj.updateCustomerLineDot = true;
        }else if(traVal.topChatBar.activeTab == 'customerLine' && recProto.msgBy == "biddoc" ){
            $scope.noticeObj.updateIronChatDot = true;
        }

        //如果列表没有该聊天对象
        if (indexOfChatcode(list, recProto.chatNum, 'chat_code') == -1) {

            if(recProto.msgBy == "biddoc"){
                //获取聊天号 chat_code
                var tData = {
                    chat_code: recProto.chatNum
                };

                //通过chat_code建立聊天
                traVal.communicate_by_chatcodeFn(tData, function(res, status, headers, config) {

                    //输出列表内容
                    if (res.code === 0) {
                        //更新聊天头像
                        res.result.commuBiddocInfo.unreadMsgCount = recProto.msgCount;
                        list.unshift(res.result.commuBiddocInfo);
                    }else{
                        //错误信息
                        $rootScope.errAlertModalConstant = {
                            contentText:errCode(res.code),
                            isOpen:true
                        };
                    }

                }, function(res, status, headers, config) {
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    };
                });
            }else if(recProto.msgBy == "conversation"){
                //获取专线沟通买家详情
                traVal.buyerAccountId = recProto.sendId;
                traVal.buyerChatCode = recProto.chatNum;
                traVal.special_buyer_infoFn(function(res, status, headers, config) {
                    //输出列表内容
                    if (res.code === 0) {
                        var obj = $.extend(res.result, recProto);
                        obj.buyer_id = res.result.sendId;
                        obj.chat_code = res.result.chatNum;
                        $scope.CustomerLineList.push(obj);
                    }else{
                        //错误信息
                        $rootScope.errAlertModalConstant = {
                            contentText:errCode(res.code),
                            isOpen:true
                        };
                    }
                }, function(res, status, headers, config) {
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    };
                });
            }


        }
        //如果新消息不在当前窗口
        else {
            console.log(recProto);
            angular.forEach(list, function(value, key) {
                if (value.chat_code === recProto.chatNum) {

                    $timeout(function() {

                        //将新消息通知的头像移动到最前
                        list.unshift(list.splice(key, 1)[0]);
                        //递增聊天数量通知
                        list[0].unreadMsgCount++;
                        $scope.$apply();
                    })

                }
            })

        }

    }

    // 显示历史消息
    function showHisMsg(recProto) {

        var length = recProto.arrHisMsg.length;
        if (length > 0) {
            // 遍历消息
            for (var i = 0, l = recProto.arrHisMsg.length; i < l; ++i) {
                var hisMsgItem = recProto.arrHisMsg[i];
                // 发送消息状态
                if (hisMsgItem.fromTo == fromTo) {
                    if (hisMsgItem.readFlag) {
                        hisMsgItem.msgStatus = 2;
                    } else {
                        hisMsgItem.msgStatus = 1;
                    }
                }
            }

            $scope.updateMsgInfo(recProto);
            // 标记最上一条流水号
            curOrderChat[recProto.chatNum].hisSerialNum = recProto.arrHisMsg[length - 1].serialNum;
        }

        //判断是否还有历史消息
        if ($scope.historyisShow['chat_' + curChatNum] = 'historyMsg') {
            scrollToFirst();
        } else {
            scrollToEnd();
        }
    }

    //显示聊天表情
    $scope.showFaceBar = function(){
        $scope.chart.showFace = !$scope.chart.showFace
    };

}]);

//新的订单
app.controller('lootOrderCtr', ['$rootScope', '$scope', '$state', '$timeout', 'traVal', 'traPoints', function($rootScope, $scope, $state, $timeout, traVal, traPoints) {

    //订单列表初始化
    $scope.newBiddocs = [];

    //设置是否还有新数据状态
    $scope.dataNewBiddocsState = true;
    //分页初始位置设置
    traVal.orderPage = 0;

    //没有订单提示图片状态
    $scope.noOrder = {};
    $scope.noOrder.isShow = false;

    //滚动分页读取

    $scope.loadNewBiddocsMore = function() {

        if ($scope.dataNewBiddocsState) {
            traVal.newBiddocsFn(function(res, status, headers, config) {
                $scope.pageTip = "数据加载中！";
                //输出列表内容
                if (res.code == 0) {
                    if (res.result.newBiddocs.length != 0) {

                        //订单列表详情数据分页
                        for (var i = 0; i < res.result.newBiddocs.length; i++) {
                            //构建数据
                            $scope.newBiddocs.push(res.result.newBiddocs[i]);
                        }

                        traVal.orderPage++;

                    } else if (res.result.newBiddocs.length == 0 &&  traVal.orderPage == 0) {
                        //设置没有订单提示图片
                        $scope.noOrder.isShow = true;
                    }

                    if (res.result.newBiddocs.length < 20 && traVal.orderPage != 1) {
                        $scope.dataNewBiddocsState = !$scope.dataNewBiddocsState;
                        $scope.pageTip = "已经没有更多数据";

                    }else if(res.result.newBiddocs.length < 20 && traVal.orderPage == 1){
                        $scope.dataNewBiddocsState = !$scope.dataNewBiddocsState;
                        $scope.pageTip = "";
                    }

                }else{
                    //错误信息
                    $scope.pageTip = errCode(res.coed);
                }

            }, function(res, status, headers, config) {
                //错误信息
                $scope.pageTip = errCode();
            })
        }
    };
    $scope.loadNewBiddocsMore();

    //接收通知更新新订单
    $scope.updatePipeiBiddoc = function(data) {

        //设置新订单状态
        data.bid_notify_status = 0;
        $scope.$apply(function() {
            $scope.newBiddocs.unshift(data);
            if ($scope.noOrder.isShow) {
                //隐藏没有订单通知提示
                $scope.noOrder.isShow = false;
            }
        });

    }

    //通知卖家订单已过期
    $scope.updateBiddocExpireStatus = function(biddocIds) {
        angular.forEach(biddocIds, function(value, key){
            var res = indexOfChatcode($scope.newBiddocs, value, 'biddoc_id');
            if (res != -1 ) {
                $scope.$apply(function(){
                    $scope.newBiddocs[res].bid_notify_status = 2;
                    console.log($scope.newBiddocs[res]);
                })
            }
        });
    }

    //通知卖家订单已抢完
    $scope.updateBiddocStatus = function(biddocId) {
        var res = indexOfChatcode($scope.newBiddocs, biddocId, 'biddoc_id');
        if (res == -1 ) return;
        $scope.$apply(function(){
            $scope.newBiddocs[res].bid_notify_status = 2;
        })
    }

    //获取标书详情
    $scope.biddocInfoModal = function(biddoc_id) {
        //传入参数
        traVal.biddoc_id = biddoc_id;
        traVal.biddocInfoFn(function(res, status, headers, config) {
            console.log("biddocInfoModal", res)
                //输出列表内容
            if (res.code == 0) {
                $scope.biddocInfo = res.result.biddocInfo;
                $scope.buyerCompanyInfo = res.result.buyerCompanyInfo;
                $timeout(function(){
                    initScroll("#orderInfo .partList");
                })
            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                }
            }

        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(),
                isOpen:true
            }
        })
    }

    //抢单操作
    $scope.lootOrder = function(index) {
        var newBiddocs = $scope.newBiddocs[index];

        //设置按钮状态为抢单中...
        newBiddocs.bid_notify_status = 4;

        // 清单提交数据
        var tData = {
            biddocId: newBiddocs.biddoc_id,
            companyId: newBiddocs.company_id,
            sellerId: newBiddocs.seller_id,
            scopeId: newBiddocs.scope_id
        };

        //抢单接口
        traVal.sellerrushFn(tData, function(res, status, headers, config) {
            if (res.code == 0) {
                if (res.result.grabResult == 'success') {
                    //更新页面状态为已经抢到
                    newBiddocs.bid_notify_status = 1;
                    res.result.commuBiddocInfo.isPartner = res.result.isPartner;
                    res.result.commuBiddocInfo.unreadMsgCount = 0;
                    $scope.newBiddocs[index].isPartner = res.result.isPartner;
                    $rootScope.initordercenter.SumBiddocs.sum += 1;
                    // 创建一个聊天
                    angular.element(chatWindow).scope().updateChatItems(res.result.commuBiddocInfo);
                    //抢单获取积分
                    traPoints.getPointsFn('lootOrder', $scope.getPointsCallBack);
                }
            }else if(res.code == 180003){
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText: '账户嗖豆余额不足，抢单失败，请尽快购买嗖豆!',
                    isOpen: true
                }
                newBiddocs.bid_notify_status = 0;
            } else {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText: errCode(res.code),
                    isOpen: true
                }
                //更新页面状态更新为抢单结束
                newBiddocs.bid_notify_status = 2;
            }
        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(),
                isOpen:true
            }
        })

        return;
    }

    //跳转到当前触发聊天信息
    $scope.chatJump = function(item) {
        angular.element(orderMain).scope().updateChatAvatar(item);
    }

}]);

//待处理订单
app.controller('pendOrderCtr', ['$rootScope', '$scope', '$state', '$timeout', 'traVal', function($rootScope, $scope, $state, $timeout, traVal) {

    //待处理订单列表初始化
    $scope.processOrders = [];

    //生成订单详情数据初始化
    $scope.pendOrderData = {};

    //没有订单提示图片状态
    $scope.noOrder = {};
    $scope.noOrder.isShowProcess = false;

    //设置是否还有新数据状态
    $scope.dataProcessOrdersState = true;

    //滚动分页读取
    $scope.loadProcessOrdersMore = function(recProto) {

        //如果是消息通知，清空待处理订单
        if (recProto) {
            $scope.processOrders = $scope.processOrders = [];
            traVal.tData.pagestart = 0;
            $scope.dataProcessOrdersState = true;
        }

        //转换订单说明文字
        $scope.getorderinfotatusFn = getorderinfotatusFn;

        if ($scope.dataProcessOrdersState) {

            traVal.gettradingordersFn(traVal.tData, function(res, status, headers, config) {
                $scope.pageTip = "数据加载中！";
                //输出列表内容
                if (res.code == 0) {

                    if (res.result.processOrders.length != 0) {
                        //订单列表详情数据分页
                        for (var i = 0; i < res.result.processOrders.length; i++) {
                            $scope.processOrders.push(res.result.processOrders[i]);
                        }

                        traVal.tData.pagestart++;
                        $scope.pageTip = "";


                        //待处理订单数量
                        $rootScope.processCount = res.result.processCount;

                        //设置没有订单提示图片
                        $scope.noOrder.isShowProcess = false;

                    } else if (res.result.processOrders.length == 0 && traVal.tData.pagestart == 0) {
                        //设置没有待处理订单提示图片
                        $scope.noOrder.isShowProcess = true;
                    }

                    if (res.result.processOrders.length < 20 && traVal.tData.pagestart > 1) {
                        $scope.dataProcessOrdersState = !$scope.dataProcessOrdersState;
                        $scope.pageTip = "已经没有更多数据";
                    }else if(res.result.processOrders.length < 20 && traVal.tData.pagestart == 1){
                        $scope.dataProcessOrdersState = !$scope.dataProcessOrdersState;
                        $scope.pageTip = "";
                    }
                }else{
                    $scope.pageTip = errCode(res.code);
                }
            }, function(res, status, headers, config) {
                $scope.pageTip = errCode();
            })

        }

    };




    //跳转到当前触发聊天信息
    $scope.chatJump = function(item) {
        angular.element(orderMain).scope().updateChatAvatar(item);
    }

    //待处理订单模态框 生成订单
    $scope.pendOrderInfoModel = function(item, new_base_status) {
        //生成订单
        if (item.status_flag == 'PLACE') {
/*
            //传入参数,请求标书详情
            traVal.biddoc_id = item.biddoc_id;

            traVal.biddocInfoFn(function(res, status, headers, config) {
                //输出列表内容
                if (res.code == 0) {
                    $scope.biddocInfo = res.result.biddocInfo;
                    $scope.buyerCompanyInfo = res.result.buyerCompanyInfo;

                    //合并标书详情及待处理订单详情
                    $scope.pendOrderData = $.extend({}, $scope.biddocInfo, item);
                    $scope.pendOrderData.logistics_type = 'pick_up';
                    //模态框状态
                    $scope.pendOrderData.status = item.status_flag;
                    console.log("pendOrderData", $scope.pendOrderData)

                    //配件操作
                    partEdit($scope.pendOrderData, $scope.pendOrderData.parts, 'pendOrderData.parts');
                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    }
                }

            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                }
            })
            */
        } else if (item.status_flag == 'MODIFY') {
            //修改订单
            //传入参数,请求标书详情
            traVal.purchase_order_id = item.purchase_order_id;

            traVal.get_order_infoFn(function(res, status, headers, config) {
                //输出列表内容
                if (res.code == 0) {
                    console.log(res)
                    //取得当前订单数据
                    $scope.curOrderData = res.result[res.result.length-1];
                    //取得原订单数据
                    $scope.initOrderData = res.result[0];

                    //模态框状态
                    $scope.pendOrderData.status = $scope.curOrderData.orderStatus.status_flag;

                    //配件操作
                    partEdit($scope.curOrderData.orderInfo, $scope.curOrderData.partsInfo, 'partsInfo');

                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    }
                }

            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                }
            })
        }

        //生成订单配件操作
        function partEdit(orderInfo, partData, partWatch) {
            //删除待处理订单模态框配件
            $scope.partsRemove = function(index) {
                var item = partData[index];
                partData.splice(partData.indexOf(item), 1);
            };

            //增加待处理订单模态框配件
            $scope.partsAdd = function() {

                var partid = 'C0' + partData.length;
                var part = {
                    "part_id": partid,
                    "part_name": "",
                    "part_brand_type": "",
                    "part_brand_name": "",
                    "unit_price": "",
                    "number": "",
                    "subtotal": "",
                    "remark": ""
                }
                partData.push(part);
            }

            //监听选择配件数据变化获取总价
            $scope.$watch(partWatch, function(newVal, oldVal) {
                if (newVal == oldVal) {
                    return;
                }

                //赋值总价
                orderInfo.order_money = 0;

                //获取价格
                angular.forEach(partData, function(value, key) {
                    if (value.number && value.unit_price) {
                        orderInfo.order_money = Math.formatFloat(orderInfo.order_money + (value.number * value.unit_price), 2);
                    }
                });

            }, true);
        }

    }


    //生成订单接口
    $scope.neworderChange = function(status) {

        //新订单生成
        if (status == 'PLACE') {
/*
            if ($scope.pendOrderData.logistics_money) {
                $scope.pendOrderData.total_money = $scope.pendOrderData.order_money + $scope.pendOrderData.logistics_money;
            } else {
                $scope.pendOrderData.total_money = $scope.pendOrderData.order_money;
                $scope.pendOrderData.logistics_money = 0;
            }

            var tData = {
                "place_id": $scope.pendOrderData.place_id,
                "biddoc_type": $scope.pendOrderData.biddoc_type,
                "order_type": 1,
                "status_flag": "CREATE",
                "bid_id": $scope.pendOrderData.bid_id,
                "biddoc_id": $scope.pendOrderData.biddoc_id,
                "biddoc_note": $scope.pendOrderData.biddoc_note,
                "scope_id": $scope.pendOrderData.scope_id,
                "scope_name": $scope.pendOrderData.scope_name,
                "factory_id": $scope.pendOrderData.factory_id,
                "factory_name": $scope.pendOrderData.factory_name,
                "model_id": $scope.pendOrderData.model_id,
                "model_name": $scope.pendOrderData.model_name,
                "vin": $scope.pendOrderData.VIN,
                "chat_code": $scope.pendOrderData.chat_code,
                "buyer_company_id": $scope.pendOrderData.buyer_company_id,
                "buyer_company_name": $scope.pendOrderData.buyer_company_name,
                "buyer_id": $scope.pendOrderData.buyer_id,
                "buyer_contact_tel": $scope.pendOrderData.contactTel,
                "buyer_contact_name": $scope.pendOrderData.buyer_fullName,
                "buyer_company_provience": $scope.buyerCompanyInfo.org_province_name,
                "buyer_company_city": $scope.buyerCompanyInfo.org_city_name,
                "buyer_company_county": $scope.buyerCompanyInfo.org_county_name,
                "buyer_company_address": $scope.buyerCompanyInfo.org_address,
                "seller_contact_tel": $rootScope.initordercenter.companyInfo.org_contact_tel,
                "seller_contact_name": $rootScope.initordercenter.companyInfo.org_contact,
                "seller_company_provience": $rootScope.initordercenter.companyInfo.org_province_name,
                "seller_company_city": $rootScope.initordercenter.companyInfo.org_city_name,
                "seller_company_county": $rootScope.initordercenter.companyInfo.org_county_name,
                "seller_company_address": $rootScope.initordercenter.companyInfo.org_address,
                "logistics_type": $scope.pendOrderData.logistics_type || '',
                "logistics_name": $scope.pendOrderData.logistics_name,
                "logistics_money": $scope.pendOrderData.logistics_money,
                "order_money": $scope.pendOrderData.order_money,
                "total_money": $scope.pendOrderData.total_money,
                "parts": JSON.stringify($scope.pendOrderData.parts)
            }

            traVal.neworderFn(tData, function(res, status, headers, config) {

                console.log("neworder", res);
                if (res.code == 0) {
                    //更改当前订单状态
                    angular.forEach($scope.processOrders, function(value, key) {
                        if (value.place_id == $scope.pendOrderData.place_id) {
                            $scope.processOrders[key].status_flag = 'CREATE';
                        }
                    });
                    //待处理订单数量-1
                    $rootScope.processCount--;
                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    }
                }
            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                }
            })
*/
        } else if (status == 'MODIFY') {

            if ($scope.curOrderData.orderInfo.logistics_money) {
                $scope.curOrderData.orderInfo.total_money = $scope.curOrderData.orderInfo.order_money + $scope.curOrderData.orderInfo.logistics_money;

            } else {
                $scope.curOrderData.orderInfo.total_money = $scope.curOrderData.orderInfo.order_money;
            }

            var tData = {
                "purchase_order_id": $scope.curOrderData.orderInfo.purchase_order_id,
                "status_flag": "CREATE",
                "buyer_contact_tel": $scope.curOrderData.orderInfo.buyer_contact_tel,
                "buyer_contact_name": $scope.curOrderData.orderInfo.buyer_contact_name,
                "buyer_company_provience": $scope.curOrderData.orderInfo.buyer_company_provience,
                "buyer_company_city": $scope.curOrderData.orderInfo.buyer_company_city,
                "buyer_company_county": $scope.curOrderData.orderInfo.buyer_company_county,
                "buyer_company_address": $scope.curOrderData.orderInfo.buyer_company_address,
                "seller_contact_tel": $scope.curOrderData.orderInfo.seller_contact_tel,
                "seller_contact_name": $scope.curOrderData.orderInfo.seller_contact_name,
                "seller_company_provience": $scope.curOrderData.orderInfo.seller_company_provience,
                "seller_company_city": $scope.curOrderData.orderInfo.seller_company_city,
                "seller_company_county": $scope.curOrderData.orderInfo.seller_company_county,
                "seller_company_address": $scope.curOrderData.orderInfo.seller_company_address,
                "logistics_type": $scope.curOrderData.orderInfo.logistics_type,
                "logistics_name": $scope.curOrderData.orderInfo.logistics_name,
                "logistics_money": $scope.curOrderData.orderInfo.logistics_money,
                "order_money": $scope.curOrderData.orderInfo.order_money,
                "total_money": $scope.curOrderData.orderInfo.total_money,
                "parts": JSON.stringify($scope.curOrderData.partsInfo)
            }

            traVal.updateorderFn(tData, function(res, status, headers, config) {

                console.log("updateorder", res);
                if (res.code == 0) {
                    //更改当前订单状态
                    angular.forEach($scope.processOrders, function(value, key) {
                        if (value.purchase_order_id == $scope.curOrderData.orderInfo.purchase_order_id) {
                            $scope.processOrders[key].status_flag = 'CREATE';
                        }
                    });
                    //待处理订单数量-1
                    $rootScope.processCount--;
                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    }
                }
            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                }
            })

        }
    }

    //待处理订单模态框(已生成订单)
    $scope.getorderinfoModel = function(item, new_base_status) {
        //当前点击时间(退款时用)
        if (new_base_status == 'RETURN_FINISH') {
            traVal.handle_time = new Date().getTime();
            traVal.check_token = localStorage.user_refresh_token.split(' ')[1];
        }

        //传入参数,请求标书详情
        traVal.purchase_order_id = item.purchase_order_id;

        //请求待处理订单详情
        traVal.get_order_infoFn(function(res, status, headers, config) {
            if (res.code == 0) {

                //取得返回订单数组长度
                $scope.getorderinfoLen = res.result.length;

                //判断是否有退货订单
                if ($scope.getorderinfoLen > 1) {
                    //有退货订单
                    $scope.orderView = 'curOrder';
                }else{
                    //无退货订单
                    $scope.orderView = 'initOrder';
                }

                //取得原订单数据
                $scope.initOrderData = res.result[0];
                //取得当前订单数据
                $scope.curOrderData = res.result[res.result.length-1];

                console.log('当前订单', $scope.curOrderData);
                console.log('原订单', $scope.initOrderData);

                //待处理订单转换订单状态 新订单状态
                $scope.curOrderData.orderStatus.new_base_status = new_base_status;
                $scope.currentOrder = item;

                //模态框状态
                if ($scope.initOrderData.orderStatus.freeze_status == 'RETURN_FREEZE' || $scope.initOrderData.orderStatus.freeze_status == 'APPROVAL_FREEZE') {
                    $scope.pendOrderData.status = 'RETURN_PROCESSING';
                }else{
                    $scope.pendOrderData.status = $scope.curOrderData.orderStatus.status_flag;
                }

                //订单详情转换文字显示状态
                $scope.getorderinfotatus = getorderinfotatusFn($scope.curOrderData.orderStatus.status_flag, $scope.curOrderData.orderInfo.logistics_type, $scope.initOrderData.orderInfo.trade_money, $scope.initOrderData.orderStatus.freeze_status);

            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                }
            }

        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(),
                isOpen:true
            }
        })

    }

    //模态框调用初始化(必须设置)
    $scope.msAlertModalConfig = {};

    //修改订单状态接口
    $scope.updateorderstatusChange = function(status) {

        //确认退货提交按钮
        if (status == 'RETURN_AGREE') {

            //模态框调用
            $scope.msAlertModalConfig = {
                contentText: '<p class="font16 text-center">同意买方的退货申请吗？</p>',
                sureText: '同意', //确定按钮
                cancelText: '驳回', //驳回按钮
                cancelConfig: true, //是否包含取消按钮
                backdrop: true, //设置是否可点击背景关闭
                sizeConfig: 'sm',
                isOpen: true
            }

            //待处理订单转换订单状态 旧订单状态
            $scope.initOrderData.orderStatus.old_base_status = orderstatusFn($scope.initOrderData.orderStatus.status_flag);

            var tData = {
                "old_base_status": $scope.initOrderData.orderStatus.old_base_status,
                "new_base_status": '',
                "status_flag": '',
                "purchase_order_id": $scope.curOrderData.purchase_order_id,
                "logistics_order": '',
                "flow_id": ''
            }

            //同意买方的退货申请
            $scope.alertmodelOk = function() {
                    $scope.msAlertModalConfig.isOpen = false;
                    tData.new_base_status = orderstatusFn('RETURN_AGREE');
                    tData.status_flag = 'RETURN_AGREE';

                    //关闭模态框
                    $('#pendOrderInfo').modal('hide');

                    //提交状态更新请求
                    traVal.updateorderstatusFn(tData, function(res, status, headers, config) {

                        if (res.code == 0) {
                            //更改当前订单状态
                            angular.forEach($scope.processOrders, function(value, key) {
                                if (value.purchase_order_id == $scope.curOrderData.purchase_order_id) {
                                    $scope.processOrders[key].status_flag = 'RETURN_AGREE';
                                }
                            });
                            //待处理订单数量-1
                            $rootScope.processCount--;
                        }
                    }, function(res, status, headers, config) {
                        console.log("订单状态更新异常");
                    })

                }
                //驳回买方的退货申请
            $scope.alertmodelCancel = function() {
                $scope.msAlertModalConfig.isOpen = false;
                tData.new_base_status = orderstatusFn('RETURN_DISAGREE');
                tData.status_flag = 'RETURN_DISAGREE';

                //关闭模态框
                $('#pendOrderInfo').modal('hide');

                //提交状态更新请求
                traVal.updateorderstatusFn(tData, function(res, status, headers, config) {

                    if (res.code == 0) {
                        //更改当前订单状态
                        angular.forEach($scope.processOrders, function(value, key) {
                            if (value.purchase_order_id == $scope.initOrderData.purchase_order_id) {
                                $scope.processOrders[key].status_flag = tData.status_flag;
                            }
                        });
                        //待处理订单数量-1
                        $rootScope.processCount--;
                    }else{
                        //错误信息
                        $rootScope.errAlertModalConstant = {
                            contentText:errCode(res.code),
                            isOpen:true
                        }
                    }
                }, function(res, status, headers, config) {
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(),
                        isOpen:true
                    }
                })
            }

        } else if (status == 'RETURN_UNPAID') {
            //确认收到退货
            //模态框调用
            $scope.msAlertModalConfig = {
                contentText: '<p class="font16 text-center">收到退货了吗？</p>',
                sureText: '收到', //确定按钮
                cancelText: '还没', //驳回按钮
                cancelConfig: true, //是否包含取消按钮
                backdrop: true, //设置是否可点击背景关闭
                sizeConfig: 'sm',
                isOpen: true
            }

            //待处理订单转换订单状态 旧订单状态
            $scope.initOrderData.orderStatus.old_base_status = orderstatusFn($scope.initOrderData.orderStatus.status_flag);

            var tData = {
                    "old_base_status": $scope.initOrderData.orderStatus.old_base_status,
                    "new_base_status": '',
                    "status_flag": '',
                    "purchase_order_id": $scope.curOrderData.purchase_order_id,
                    "logistics_order": '',
                    "flow_id": ''
                }
            //收到退货
            $scope.alertmodelOk = function() {
                    $scope.msAlertModalConfig.isOpen = false;
                    tData.new_base_status = orderstatusFn('RETURN_UNPAID');
                    tData.status_flag = 'RETURN_UNPAID';

                    //关闭模态框
                    $('#pendOrderInfo').modal('hide');
                    console.log(tData);

                    //提交状态更新请求
                    traVal.updateorderstatusFn(tData, function(res, status, headers, config) {

                        console.log("updateorderstatus", res)
                        if (res.code == 0) {
                            //更改当前订单状态
                            angular.forEach($scope.processOrders, function(value, key) {
                                if (value.purchase_order_id == $scope.curOrderData.purchase_order_id) {
                                    $scope.processOrders[key].status_flag = 'RETURN_UNPAID';
                                }
                            });
                            //待处理订单数量-1
                            $rootScope.processCount--;
                        }else{
                            //错误信息
                            $rootScope.errAlertModalConstant = {
                                contentText:errCode(res.code),
                                isOpen:true
                            }
                        }
                    }, function(res, status, headers, config) {
                        //错误信息
                        $rootScope.errAlertModalConstant = {
                            contentText:errCode(),
                            isOpen:true
                        }
                    })


                }
            //还没收到退货
            $scope.alertmodelCancel = function() {
                $scope.msAlertModalConfig.isOpen = false;
            }

        } else {
            //立即发货
            //待处理订单转换订单状态 旧订单状态
            $scope.initOrderData.orderStatus.old_base_status = orderstatusFn($scope.initOrderData.orderStatus.status_flag);

            var tData = {
                "old_base_status": $scope.initOrderData.orderStatus.old_base_status,
                "new_base_status": orderstatusFn($scope.initOrderData.orderStatus.new_base_status),
                "status_flag": $scope.initOrderData.orderStatus.new_base_status,
                "purchase_order_id": $scope.initOrderData.purchase_order_id,
                "logistics_order": $scope.initOrderData.orderInfo.logistics_order,
                "flow_id": $scope.initOrderData.orderInfo.trade_id
            }

            //提交状态更新请求
            traVal.updateorderstatusFn(tData, function(res, status, headers, config) {

                console.log("updateorderstatus", res)
                if (res.code == 0) {
                    //更改当前订单状态
                    angular.forEach($scope.processOrders, function(value, key) {
                        if (value.purchase_order_id == $scope.initOrderData.purchase_order_id) {
                            $scope.processOrders[key].status_flag = tData.status_flag;
                        }
                    });
                    //待处理订单数量-1
                    $rootScope.processCount--;
                }else{
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    }
                }
            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                }
            })
        }
    }


    //退款支付提交
    $scope.order_refundChange = function(payment, cashPassword) {

        if (!payment) {
            alert("请选择支付平台");
            return;
        }

        //防止重复点击
        if (repeatClick()) {
            return;
        };

        var tData;

        if (payment == 'wallet') {
        tData = {
            order_id: $scope.curOrderData.purchase_order_id,
            trade_money: $scope.curOrderData.orderInfo.actual_returned_money,
            client_key:md5($scope.curOrderData.purchase_order_id + payment + $scope.curOrderData.orderInfo.actual_returned_money + traVal.check_token),
            handle_time:traVal.handle_time,
            channel: payment,
            password: md5(cashPassword)
        }
            //提交状态更新请求
            traVal.orderrefundbywalletFn(tData, function(res, status, headers, config) {

                console.log("orderrefundbywallet", res)
                if (res.code == 0) {
                    //跳转到退款成功页面
                    //window.open("paySuccess.html?param=orderrefundbywalle","_blank");
                    alert('付款成功');
                    //关闭模态框
                    $('#pendOrderInfo').modal('hide');
                    $state.reload();

                } else {
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    }
                }
            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                }
            })

            return;
        }

        //轮询
        var startLoop = false; //启动轮询,false-关闭，true-启动
        var timerID = ''; //定时器ID
        $("#wxPayModal").on('show.bs.modal', function() {
            startLoop = true;
        });

        $('#wxPayModal').on('hide.bs.modal', function() {
            startLoop = false;
        });

        tData = {
            order_id: $scope.curOrderData.purchase_order_id,
            trade_money: $scope.curOrderData.orderInfo.actual_returned_money,
            client_key:md5($scope.curOrderData.purchase_order_id + payment + $scope.curOrderData.orderInfo.actual_returned_money + traVal.check_token),
            handle_time:traVal.handle_time,
            channel: payment
        }
        //其他支付方式
        traVal.fetchrefundchargeFn(tData, function(res, status, headers, config) {

            console.log("fetchrefundcharge", res)
            if (res.code == 0) {

                if (res.result.channel == 'wx_pub_qr') {
                    createQrcode(res.result.credential.wx_pub_qr);
                    $('#wxPayModal').modal({
                      show:true,
                      keyboard: false,
                      backdrop: 'static'
                    })
                    $("#pendOrderInfo").modal('hide');

                    if (timerID == '') {
                        timerID = setInterval(function() {
                            if (startLoop) {

                                traVal.orderno = res.result.order_no;

                                //轮询接口
                                traVal.getorderstatusFn(function(res, status, headers, config) {
                                    console.log("getorderstatus", res);
                                    //输出列表内容
                                    if (res.code == 0) {
                                        //跳转到付款成功页面
                                        //window.open("paySuccess.html?param=fetchsoudoucharge","_blank");
                                        alert('付款成功');
                                        //关闭模态框
                                        $('#pendOrderInfo').modal('hide');
                                        $("#wxPayModal").modal('hide');
                                        startLoop = false;
                                        $state.reload();

                                    }else if(res.code == 180016  && res.stack.lefttime < 0){
                                        alert('订单失效请重新尝试，如有问题请联系客服');
                                        $scope.modelSet.buySoudou = false;
                                        $("#wxPayModal").modal('hide');
                                    }else if(res.code == 180006){
                                        alert('不是同一个卖家下的充值订单');
                                        $scope.modelSet.buySoudou = false;
                                        $("#wxPayModal").modal('hide');
                                    }else if(res.code == 180005){
                                        alert('在线付款时没有对应的商品单号');
                                        $scope.modelSet.buySoudou = false;
                                        $("#wxPayModal").modal('hide');
                                    }

                                }, function(res, status, headers, config) {
                                    console.log("轮询数据错误");
                                })


                            } else {
                                clearInterval(timerID);
                                timerID = '';
                            }
                        }, 3000);
                    }
                } else {
                    // upacp_pc 和 alipay_pc_direct的场合
                    pingppPc.createPayment(res.result, function(result, err) {
                        return;
                        //console.log(result);
                        //console.log(err);
                    });
                }
            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                }
            }
        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(),
                isOpen:true
            }
        })

    }

    //获取openID，钱包余额，是否设置交易密码
    $scope.withdrawChange = function() {

        $scope.modelSet = {};
        traVal.withdrawFn(function(res, status, headers, config) {
            //输出列表内容
            if (res.code == 0) {
                console.log("withdraw", res);
                $scope.withdraw = {
                    "open_id": res.result.open_id,
                    "walletbalance": res.result.walletbalance,
                    "passwordFlag": res.result.passwordFlag
                }
            }else{
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(res.code),
                    isOpen:true
                }
            }
        }, function(res, status, headers, config) {
            //错误信息
            $rootScope.errAlertModalConstant = {
                contentText:errCode(),
                isOpen:true
            }
        })


    }


}]);

/************************************************
 *  directives指令
************************************************/

/**************************
 * 模态窗模板 demo
 **************************/
app.directive('chatForwardMsg', function() {
    return {
        restrict: 'AECM',
        transclude: true,
        replace: false,
        templateUrl: 'template/modelTemp/chatForwardMsg.html',
        link: function(scope, element, attrs, ngModel) {
            scope.chatForwardMsgOpen = false;

        }
    };
});

/**************************
 * 通用模态窗模板设置
 **************************/
app.directive('msAlertModal', ['$rootScope', function($rootScope) {
    return {
        restrict: 'AECM',
        transclude: true,
        replace: false,
        templateUrl: 'template/modelTemp/alertmodelTemplate.html',
        link: function(scope, element, attrs, modalController) {
            scope.msAlertModalConstant = {
                titleText: '车后邦提醒',
                cancelText: '取消', //取消按钮
                sureText: '确定', //确定按钮
                backgroundConfig: true //设置是否遮罩背景
            };

            scope.getText = function(key) {
                return scope.msAlertModalConfig[key + 'Text'] || scope.msAlertModalConstant[key + 'Text'];
            };

            scope.setConfig = function(key) {
                return scope.msAlertModalConfig[key + 'Config'] || scope.msAlertModalConstant[key + 'Config'];
            };

            //为模态框赋上时间戳ID
            var _modalId = attrs.id ? attrs.id : "_modal" + (Date.now());
            scope.modalid = _modalId;

            scope.alertmodelClose = function(type) {
                scope.msAlertModalConfig.isOpen = false;
            };

            //设置点击背景是否关闭 true为可关闭，false为不能点击背景关闭
            scope.msAlertModalConfig.backdrop = false;

            element.on('click', function(event) {
                if (scope.msAlertModalConfig.backdrop === true && event.target.className == "show modalTip modal fade in") {
                    scope.$apply(
                        function() {
                            scope.alertmodelClose();
                        });
                }
            });
        }
    };
}]);

/**************************
 * 错误code模态窗模板设置
 **************************/
angular.module("err.alertModal",[])
.constant('errAlertModalConstant',{
    titleText: '系统提醒',
    sureText: '确定', //确定按钮
    backgroundConfig: true, //设置是否遮罩背景
    sizeConfig: 'sm', //设置模态框大小
    isOpen:false
});

app.directive('errAlertModal', ['$rootScope', 'errAlertModalConstant', function($rootScope, errAlertModalConstant) {
    return {
        restrict: 'AECM',
        transclude: true,
        replace: false,
        templateUrl: 'template/modelTemp/errCodemodelTemplate.html',
        link: function(scope, element, attrs, modalController) {
            scope.getErrText = function(key) {
                return errAlertModalConstant[key + 'Text'];
            };

            scope.setErrConfig = function(key) {
                return errAlertModalConstant[key + 'Config'];
            };

            //为模态框赋上时间戳ID
            var _modalId = attrs.id ? attrs.id : "_modal" + (Date.now());
            $rootScope.errmodalid = _modalId;

            scope.errmodelClose = function(type) {
                $rootScope.errAlertModalConstant.isOpen = false;
            };

        }
    };
}]);

/**************************
 * 待处理操作订单提示模态框模板设置
 **************************/
app.directive('pendorderAlertModal', ['$rootScope', function($rootScope) {
    return {
        restrict: 'AECM',
        transclude: true,
        replace: false,
        templateUrl: 'template/modelTemp/pendorderTemplate.html',
        link: function(scope, element, attrs, modalController) {
            scope.msAlertModalConstant = {
                titleText: '车后邦提醒',
                cancelText: '取消', //取消按钮
                sureText: '确定', //确定按钮
                backgroundConfig: true //设置是否遮罩背景
            };
            scope.msAlertModalConfig.isOpen = false;
            scope.getText = function(key) {
                return scope.msAlertModalConfig[key + 'Text'] || scope.msAlertModalConstant[key + 'Text'];
            };

            scope.setConfig = function(key) {
                return scope.msAlertModalConfig[key + 'Config'] || scope.msAlertModalConstant[key + 'Config'];
            };

            //为模态框赋上时间戳ID
            var _modalId = attrs.id ? attrs.id : "_modal" + (Date.now());
            scope.modalid = _modalId;

            scope.alertmodelClose = function(type) {
                scope.msAlertModalConfig.isOpen = false;
            };

            //设置点击背景是否关闭 true为可关闭，false为不能点击背景关闭
            scope.msAlertModalConfig.backdrop = false;

            element.on('click', function(event) {
                if (scope.msAlertModalConfig.backdrop === true && event.target.className == "show modalTip modal fade in") {
                    scope.$apply(
                        function() {
                            scope.alertmodelClose();
                        });
                }
            });
        }
    };
}]);


//页面数据加载中设置dataLoading
angular.module('dataLoading', [])
    .config(
        ['$locationProvider', '$httpProvider',
            function($locationProvider, $httpProvider) {
                $httpProvider.interceptors.push('LoadingInterceptor');
            }
        ])
    .factory('LoadingInterceptor', ['$rootScope', '$timeout',
        function($rootScope, $timeout) {
            return {
                'request': function(config) {
                    $rootScope.dataLoading = true;
                    return config;
                },
                'response': function(response) {
                    $rootScope.dataLoading = false;
                    return response;
                }
            };
        }
    ]);

//开屏页
app.directive('openIng', function($state) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: function() {
          return 'template/include/opening.html?' + htmlVersion;
        },
        link: function(scope, element, attrs) {

            scope.opening = {};
            scope.$on('$stateChangeSuccess', function(event) {
                if (scope.opening.isOpen === false) return;
                if ($state.current.name == 'order') {
                    scope.opening.isOpen = false;
                    if(localStorage.getItem('opening') != '20160819'){
                        scope.opening.isOpen = true;
                    }
                }
                scope.close = function() {
                  scope.opening.isOpen = false;
                  localStorage.setItem('opening', '20160819');
                };
            });

        }
    };
});

//焦点图
app.directive('focusPic', function($rootScope, $state, traVal) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: function() {
          return 'template/include/focusPic.html?' + htmlVersion;
        },
        link: function(scope, element, attrs) {

            //焦点图
            traVal.focus_position = attrs.title;
            traVal.getFocusPicFn(function(res, status, headers, config) {
                //输出列表内容
                if (res.code === 0) {
                    scope.focusPicurl = res.result[0].focus_picurl;
                    scope.focusUrl = res.result[0].focus_url;
                }else{
                    //关闭开屏页
                    if (scope.opening.isOpen) {
                       scope.opening.isOpen = false;
                    }
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(res.code),
                        isOpen:true
                    };
                }

            }, function(res, status, headers, config) {
                //关闭开屏页
                if (scope.opening.isOpen) {
                   scope.opening.isOpen = false;
                }
                //错误信息
                $rootScope.errAlertModalConstant = {
                    contentText:errCode(),
                    isOpen:true
                };
          
            });


        }
    };
});


/************************************************
 *  filters
************************************************/

//倒序过滤
app.filter('reverse', function() {
    return function(items) {
        if (items) {
            return items.slice().reverse();
        }
    };
});

//聊天图片url处理
app.filter('filterPicPath', function() {
    return function(items) {
        if (items) {
            items = typeof items === 'string' ? items : URL.createObjectURL(items);
            var picPathArry = items.split("/chat");
            return items = picPathArry[0] + '/imgfileserver' + picPathArry[1].replace(/\//g, "-").replace("-", "\/");
        }
    };
});

//处理显示html标签的方法
app.filter('to_trusted', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

//时间过滤器
app.filter('timeFilter', function() {
    return function(date) {

        var curDate = new Date(),
            newDate = new Date(date),
            curYear = curDate.getFullYear(),
            newYear = newDate.getFullYear(),
            curDay = curDate.getDate(),
            newDay = newDate.getDate();
        if (curYear > newYear) {
            //不在当年范围
            return formatDate(date, "yyyy-MM-dd");
        } else if (curDay != newDay && newYear == curYear) {
            //超过当天范围
            return formatDate(date, "MM-dd HH:mm");
        } else {
            //当天范围内
            return formatDate(date, "HH:mm");
        }
    }
});

app.filter('timeFilterChat', function() {
    return function(date) {

        if (date) {
            if (curOrderChat[curChatNum].lastTime) {
                // 相差5分钟显示时间
                var diffSeconds = Math.abs(parseInt(new Date(curOrderChat[curChatNum].lastTime).getTime() - new Date(date).getTime()));
                if (diffSeconds / 1000 / 60 > 5) {
                    curOrderChat[curChatNum].lastTime = date;
                } else {
                    curOrderChat[curChatNum].curTime = date;
                    return;
                }
            } else {
                // 首次显示时间
                curOrderChat[curChatNum].lastTime = date;
            }

            //格式化时间函数调用
            var curDate = new Date(),
                newDate = new Date(date),
                curYear = curDate.getFullYear(),
                newYear = newDate.getFullYear(),
                curDay = curDate.getDate(),
                newDay = newDate.getDate();
            if (curYear > newYear) {
                //不在当年范围
                return formatDate(date, "yyyy-MM-dd");
            } else if (curDay != newDay && newYear == curYear) {
                //超过当天范围
                return formatDate(date, "MM-dd HH:mm");
            } else {
                //当天范围内
                return formatDate(date, "HH:mm");
            }
        }

    }
});


//时间处理函数
function formatDate(date, format) {
    if (!date)
        return;
    if (typeof(date)==="string" && date.indexOf('T')==-1) date=date.replace(/-/g, '/');
    if (!format)
        format = "yyyy-MM-dd";
    
    date = new Date(date);

    if (!date instanceof Date)
        return;
    var dict = {
        "yyyy": date.getFullYear(),
        "M": date.getMonth() + 1,
        "d": date.getDate(),
        "H": date.getHours(),
        "m": date.getMinutes(),
        "s": date.getSeconds(),
        "MM": ("" + (date.getMonth() + 101)).substr(1),
        "dd": ("" + (date.getDate() + 100)).substr(1),
        "HH": ("" + (date.getHours() + 100)).substr(1),
        "mm": ("" + (date.getMinutes() + 100)).substr(1),
        "ss": ("" + (date.getSeconds() + 100)).substr(1)
    };
    return format.replace(/(yyyy|MM?|dd?|HH?|ss?|mm?)/g, function() {
        return dict[arguments[0]];
    });
}

//聊天图片url处理
app.filter('filterPicPath', function() {
    return function(items) {
        if (items) {
            items = typeof items === 'string' ? items : URL.createObjectURL(items);
            var picPathArry = items.split("/chat");
            if (!picPathArry[1]) {
                return items;
            }
            return picPathArry[0] + '/imgfileserver' + picPathArry[1].replace(/\//g, "-").replace("-", "\/");
        }
    };
});

//订单通知文字处理
/*app.filter('placeOrderFilter', function() {
    return function(items) {
        var txt;
        if (items && items.fromTo == 1) {
            txt = ' 你可以把订单发过来了~~';
        }else{
            txt = ' 您已下单，等待对方付款！';
        }
        console.log(txt)
        return txt;
    };
});*/

//聊天表情 2016-8-8
app.service('dataService', ['$http', function($http){
    this.faceFn = function(success, error){
        $http.get(commonUrl + 'json/face.json').success(success).error(error);
    };
}]);

app.directive('faceBar', ['dataService', function(dataService){
    return {
        restricts: 'A',
        replace: false,
        templateUrl: 'face.html',
        link: function(scope, elems, attrs){
            scope.faceDatas = dataService.faceDatas;
            if(!dataService.faceDatas) {
                dataService.faceFn(function(res, status, headers, config){

                    var faceGroup = function (array, size) {
                        var arr = [];
                        for (var x = 0; x < Math.ceil((array.length-1) / size); x++) {
                            var start = x * size;
                            var end = start + size;
                            arr.push(array.slice(start, end));
                        }
                        return arr;
                    };

                    dataService.faceDatas = scope.faceDatas = faceGroup(res.groups, attrs.faceBar);

            }, function(res, status, headers, config){
                console.log('error');
            });
            }

            //获取聊天表情
            scope.getFace = function(e){
                var target = e.target;
                if(target && target.nodeName == "IMG") {
                    scope.chart.chartInput = scope.chart.chartInput || '';
                    scope.chart.chartInput += '[' +target.title+ ']';
                    scope.showFaceBar();
                }
            };

            //点击其他区域隐藏聊天框
            $(document).bind('click', function(e) {
                e.stopPropagation();
                var target = $(e.target);
                if (target.closest("#rl_exp_btn").length == 1)
                    return;
                if (target.closest("#rl_bq").length == 0) {
                    scope.$apply(function(){
                        scope.chart.showFace = false;
                    })
                }
            });


        }
    };
}]);

// 处理表情
app.filter('msgFilter', ['$sce', function($sce) {
    var rl_exp = {
        baseUrl: '../common/',
        dir: ['qqFace'],
        text: [/*表情包title文字*/
            [
                '握手', '给力', '微笑', '没问题', '欢喜', '花心', '很棒', '爱心', '扮萌', '哈哈', '再见', '喝茶', '礼物', '拜托', '耶', '可爱', '恭喜发财', '疑问', '哈哈大笑', '害羞', '酷', '舔舌', '思考', '萌笑', '露齿笑', '捂嘴笑', '吐舌', '保密', '时钟', '囧', '神马', '调皮', '小兵'
            ]
        ],
        num: [33]
    };
    return function(text) {
        if (text){
            // 表情过滤
            for (var i = -1; i < rl_exp.num[0]; i++) {
                var reg = new RegExp('\\[' + (rl_exp.text[0][i]) + '\\]', 'g');
                text = text.replace(reg, '<img src="' + rl_exp.baseUrl + 'img/' + rl_exp.dir[0] + '/' + i + '.gif" alt="' + rl_exp.text[0][i] + '" title="' + rl_exp.text[0][i] + '" />');
            }

            return $sce.trustAsHtml(text);
        }
    };
}]);

/**************************
 * 积分商城 淡入淡出提示框
 **************************/
app.directive('fadeModal', ['$rootScope', '$timeout', 'traPoints', function($rootScope, $timeout, traPoints){
    return {
        restrict: 'AE',
        replace: true,
        templateUrl: 'fadeModal.html',
        link : function(scope, elements, attrs){
            //显示积分增加状态
            scope.$parent.getPointsCallBack = function(obj){
                angular.element(elements).removeClass('show fading'); 
                scope.getPoints = obj;
                $timeout(function(){
                    angular.element(elements).addClass('show fading'); 
                    $rootScope.initordercenter.points += scope.getPoints.duiba_points;
                });
            };
            // initordercenter.points 监听
            var pointsWatcher = $rootScope.$watch('initordercenter', function (newVal, oldVal) {
                if (newVal) {
                    //登录获取积分
                    traPoints.getPointsFn('login', scope.$parent.getPointsCallBack);
                    pointsWatcher();
                }
            });
        }
    };
}]);


/**************************
 * 我的熟客模板
 **************************/
 app.directive('friendList', ['$rootScope', 'traVal', function($rootScope, traVal){
    return {
        restricts: 'AE',
        replace: false,
        templateUrl: 'friendList.html',
        link: function(scope, elems, attrs){

            //判断有无熟客数据提示
            $rootScope.chatVipTip = {};

            //熟客头像数据请求
            $rootScope.chatVipTip.isInfo = false;

            //熟客头像列表数据
            traVal.get_partnersFn(function(res, status, headers, config) {

                //输出列表内容
                if (res.code == 0) {
                    //熟客数据
                    scope.chatVIPItems = res.result.null;
                    initScroll(".friendList .media-list ul");

                    if (isEmptyObj(scope.chatVIPItems)) {
                        //未选中- 有熟客数据提示
                        $rootScope.chatVipTip.isSHow = true;
                    } else if (!isEmptyObj(scope.chatVIPItems)) {
                        //未选中- 还没有熟客数据
                        $rootScope.chatVipTip.isSHow = false;
                    }

                }else{
                    //错误信息
                    $rootScope.chatVipTip = errCode(res.code);
                }
            }, function(res, status, headers, config) {
                //错误信息
                $rootScope.chatVipTip = errCode(res.code);
            })

            //熟客头像点击窗口
            scope.friend_info = {};
            scope.chatVIPChange = function(item) {

                //传递参数
                traVal.buyer_company_id = item.friend_id;

                //熟客详情数据
                traVal.friend_infoFn(function(res, status, headers, config) {

                    //输出列表内容
                    if (res.code == 0) {
                        scope.friend_info.companyinfo = res.result.companyinfo;
                        scope.friend_info.favdealinfo = res.result.favdealinfo;
                    }else{
                        //错误信息
                        $rootScope.errAlertModalConstant = {
                            contentText:errCode(res.code),
                            isOpen:true
                        }
                    }
                }, function(res, status, headers, config) {
                    //错误信息
                    $rootScope.errAlertModalConstant = {
                        contentText:errCode(),
                        isOpen:true
                    }
                })

                //显示数据信息
                $rootScope.chatVipTip.isInfo = true;

            }
        
        }
    };
}]);