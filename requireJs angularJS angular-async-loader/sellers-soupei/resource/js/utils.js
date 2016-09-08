//共用资源文件
var commonUrl = "../common/";
//socket连接
var connectOrder = "203.195.238.225:16000";
var connectChat = "203.195.238.225:13000";
var login_front_host = 'http://seller.sosoqipei.com/';
var serviceUrl = 'http://203.195.238.225:16000/api/seller/v1.0/';
var approvalUrl = 'http://203.195.238.225:18000/api/approval/v2.0/';
var registerHost = 'http://203.195.238.225:11000';

// 刷新refresh_token;
var refreshUrl='http://203.195.238.225:12003/api/login/v2.0/seller/refreshtoken';
//嵌入html版本号
// var htmlVersion = new Date().getTime();
var htmlVersion = 20160824;
//临时变量，找出错误后删除
var initData = {};
/************************************
* 错误抛出异常 Atao 2016-08-05
 ************************************/
window.onerror = function(sMsg, sUrl, sLine, sCol, err) {
    if (localStorage.getItem("account_id") == 17190821466050000) return; //glen
    var href = window.location.href;
    if (href.indexOf('sosoqipei.com') == -1) {
        console.info(arguments);
        return;
    }
    var navigatorStr =
        '***** appVersion：' + window.navigator.appVersion +
        '***** platform：' + window.navigator.platform +
        '***** product：' + window.navigator.product +
        '***** userAgent：' + window.navigator.userAgent +
        '***** vendor：' + window.navigator.vendor +
        '***** oscpu：' + window.navigator.oscpu;
    var throwErrData = {
        account_id: localStorage.getItem("account_id") || '',
        browser: navigatorStr,
        url: href
    };
    if (!err) {
        throwErrData.err_msg = sMsg + JSON.stringify(initData);
        throwErrData.err_line = sUrl + ',line:' + sLine;
    } else {
        throwErrData.err_msg = err.message + JSON.stringify(initData);
        throwErrData.err_line = err.stack;
    }

    if (throwErrData.err_msg.indexOf('TDAPP') != -1) return;

    Errmod.saveErr(throwErrData);

    return false; //true 可以阻止错误显示在页面
};

var Errmod = (function() {
    var obj = {};
    obj.myback = null; 
    obj.loadFn = function(callback){ 
        this.myback = callback; 
    };
    obj.saveErr = function(data){ 
        if (!this.myback) return;
        this.myback(data, function(res) {});
    };
    return obj;
}());

/*******************************
* 错误异常抛出 End
 *******************************/

 //查找数组是否包含某个元素
function indexOf(ary, value) {
    for (var i = 0; i < ary.length; i++) {
        if (ary[i].chat_code == value) return i;
    }
    return -1;
}

function indexOfChatcode(ary, value, key) {
    for (var i = 0; i < ary.length; i++) {
        if (ary[i][key] == value) return i;
    }
    return -1;
}


//判断是否为{}空对象
function isEmptyObj(obj) {
    if (typeof obj === "object" && !(obj instanceof Array)) {
        var hasObj = false;
        for (var o in obj) {
            hasObj = true;
            break;
        }
        return hasObj;
    }
}

// Justin 12.29 过滤掉html标签、尾部空格、多余空行 start
function removeHTMLTag(str) {
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
    //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
    //str=str.replace(/ /ig,'');//去掉多余空行
    return str;
}

// 获取下一个消息流水号
function getNextSerialNum(chatNum) {
    curOrderChat[chatNum].serialNum += 1;
    return curOrderChat[chatNum].serialNum;
}

// 获取当前消息流水号
function getCurSerialNum(chatNum) {
    return curOrderChat[chatNum].serialNum;
}

// 显示发送的文字消息
function showTxtMsg(txtObj, chatNum) {
    txtObj.msgStatus = false;
    txtObj.msgType = txtMsgType;
    angular.element(chatWindow).scope().updateMsgInfo(txtObj);
}

// 显示最新图片消息
function showPicMsg(picObj, chatNum) {

    picObj.msgStatus = false;
    picObj.msgType = picMsgType;
    if (picObj.msgBody) {
        picObj.minPicPath = picObj.msgBody;
        picObj.picPath = picObj.msgBody;
    }
    angular.element(chatWindow).scope().updateMsgInfo(picObj);
}

// 判断新消息是否是在沟通中以及是否属于当前窗口
function isCurChatWindow(recProto, chatTab, chat_code) {

    var result = false;

    // 来消息会话是否在沟通中
    var isInCommlist = false;
    var len = chatTab.length;
    for (var i = 0; i < len; i++) {
        if (chatTab[i].chat_code == recProto.chatNum) {
            isInCommlist = true;
            break;
        }
    }

    // 来消息会话是否为当前会话页面
    if (recProto.chatNum == chat_code && isInCommlist) {
        result = true;
    }

    return result;
}

// 显示未读消息
function showUnreadMsg(recProto) {
    var length = recProto.unreadMsgArray.length;
    for (var i = 0; i < length; i++) {
        var unreadMsgItem = recProto.unreadMsgArray[i];
        if (unreadMsgItem.msgType == txtMsgType) {
            showTxtMsg(unreadMsgItem, recProto.chatNum);
        } else {
            showPicMsg(unreadMsgItem, recProto.chatNum);
        }
    }

    if (length > 0) {
        // 标记最新一条流水号
        curOrderChat[curChatNum].serialNum = recProto.unreadMsgArray[length - 1].serialNum;

        // 首次加载未读消息的场合,标记最上一条信息流水号
        if (curOrderChat[curChatNum].hisSerialNum == curOrderChat[curChatNum].serialNum) {
            curOrderChat[curChatNum].hisSerialNum = recProto.unreadMsgArray[0].serialNum;
        }
    }

}


// 滚动条滚动到最底部
function scrollToEnd() {
    //$("body").animate({scrollTop: $(".footer").offset().top});//默认滚动条在最底部
    if ($("#chatBody .tab-pane.active").length > 0) {
        $("#chatBody .tab-pane.active").mCustomScrollbar("update");
        $("#chatBody .tab-pane.active").mCustomScrollbar("scrollTo", "last", {scrollInertia: 0});
    }
}

// 滚动条滚动到顶部，比如查看更多消息
function scrollToFirst() {
    //$("body").animate({scrollTop: $(".footer").offset().top});//默认滚动条在最底部
    $("#chatBody .tab-pane.active").mCustomScrollbar("update");
    $("#chatBody .tab-pane.active").mCustomScrollbar("scrollTo", "top", {scrollInertia: 0});
}

//如果用户不在当前标签页或者最小化页面时，弹出桌面提示框
function isNotified() {

    if (isCurView == false) {
        var icon = "resource/img/msg_notify_icon.jpg";
        desktopNotify("亲，买家给您答复啦，赶紧搞定TA！", icon);
    }
}

// 隐藏发送状态图标
function hideSendStateMsg(recProto, arrMsg) {
    for (var i = arrMsg.length - 1; i > -1; --i) {
        if (arrMsg[i].serialNum == recProto.serialNum) {
            arrMsg[i].msgId = recProto.msgId;
            arrMsg[i].msgStatus = 1;
            break;
        }
    }
}

//常用语操作
function commonLangInit() {
    //解除绑定
    $("#commonLang").off();
    $("#showCommentBtn").off();

    $("#commonLang").on("click", "li", function () {

        $('#chartInput').val($(this).text());
        angular.element(chatSendMsg).scope().chart.chartInput = $(this).text();
        $("#commonLang").hide();
        $('#chartTextSend').trigger('click');
        $('#chartInput').val('');

    });
    //点击周边关闭常用语
    $(document).on("click", function () {
        $("#commonLang").hide();
    });

    //显示常用语
    $("#showCommentBtn").on("click", function (e) {
        e.stopPropagation();
        $("#commonLang").toggle();
    });
}

//图片粘帖到文本域
function pasteImage() {
    $('#chartInput').pastableTextarea();
    $('#chartInput').on('pasteImage', function (ev, data) {
        $("#modalScreenshot").modal("show");
        $("#modalScreenshot .modal-body").html('<img src="' + data.dataURL + '">');
    }).on('pasteText', function (ev, data) {
        $(this).append(data.text);
    });

}

// 点击确认发送粘贴图片
function modalScreenshot(msgBy) {
    var picBase64Data = $("#modalScreenshot .modal-body img").attr("src");
    $("#modalScreenshot").modal("hide");

    //发送截图信息
    sendCopyPicMsg(picBase64Data, msgBy);
}

// 粘贴图片发送
function sendCopyPicMsg(picBase64Data, msgBy) {
    var picObj = {serialNum: getNextSerialNum(curChatNum), msgBody: picBase64Data, fromTo: fromTo};

    // 发送图片消息
    sendMsg(picBase64Data, picMsgType, curChat, undefined, msgBy);

    // 显示图片
    showPicMsg(picObj, curChatNum);
}

//-------------------------------------------------------------------------------------------------------------------------

// 格式化日期时间，扩展日期格式化方法
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/*******************************
 * Order_Center
 * 页面操作
 ******************************/

// Variable：变量定义//////////////////////////////////////////////////////////////////////////////////////////////
var isCurView = true; // 用于来新消息时判断页面是否可视
var curChat; //当前选中对话变量
var curChatNum; // 聊天会话编号
var fromTo = 2; // 消息流向 1：买家→卖家 2：卖家→买家
var txtMsgType = 1; // 文字消息
var picMsgType = 2; // 图片消息
var jsonMsgType = 3; // JSON对象消息
var visibleBuyer = 1; // 买家可见消息
// 一次请求数据条数（历史消息)
var curOrderChat = {};


//订单页面切换初始化
function initOrder() {
    //适配聊天窗口高度调用
    $(window).resize(function() {
        fixHeight();
    }).resize();

    //聊天头像及对话框滚动条美化渲染
    initScroll("#ChatAvatar .chatLineList");
    initScroll("#chatBody .tab-pane");
    //抢单列表滚动条美化渲染
    initScrollOrder("#tab_lootOrder");
    initScrollOrder("#tab_pendOrder");

    //截图功能提示
    $("[data-toggle='tooltip']").tooltip();

    //常用语
    commonLangInit();

    //图片粘帖到文本域
    pasteImage();

    //左侧聊天区域横向拖动宽度变化
    bindResize(document.getElementById('ChatAvatar'));

    //底部聊天区域纵向拖动高度变化
    bindChatResize(document.querySelector('.chatSendMsg'));

}


// 从其它页面切换回来时滚动条重新放置在底部
window.onfocus = function() {
    scrollToEnd();
    isCurView = true;
};

// modify by kevin 12/28 通知方式修正，不管是否在当前页面都进行桌面通知
window.onblur = function() {
    isCurView = false;
};

//适配聊天窗口高度适配
function fixHeight() {
    var $winHei = $(window).height();
    var $topHei = $("#header").outerHeight(true) + $("#orderMenu").outerHeight(true);
    var $orderMainHei = $winHei - $topHei - 24;
    var $myOrdersHei = $("#myOrders").outerHeight(true);
    var $headerHei = $(".chatList .header").outerHeight(true);
    var $chatSendMsgHei = $(".chatSendMsg").outerHeight(true);
    var $chatBarHei = $(".chatBar").outerHeight(true);
    $("#tab_lootOrder").css("height", $orderMainHei - $myOrdersHei - 2);
    $("#tab_pendOrder").css("height", $orderMainHei - $myOrdersHei - 2);
    $(".media-list", "#tab_lootedOrder").css("height", $orderMainHei - 65);
    $(".media-list", $("#ChatAvatar")).css("height", $orderMainHei - $chatBarHei);
    $(".tab-pane", $("#chatBody")).css("height", $orderMainHei - $headerHei - $chatSendMsgHei);
    $("#chatWindow").css("height", $orderMainHei);
    $chatWindowHei = $("#chatWindow").outerHeight(true);
    $chatSendMsgHei = $(".chatSendMsg").outerHeight(true);
    $chatListHei = $chatWindowHei - $chatSendMsgHei;
    $(".chatList").css("height", $chatListHei);
    $(".chatSendMsg").css("height", $chatSendMsgHei);
    $("#noOrderState .panel").css("height", $winHei - $topHei - 35);
}

//滚动条美化 参数一:选择器，参数二：高度
function initScroll(sel) {
    $(sel).mCustomScrollbar({
        autoHideScrollbar: true,
        theme: "minimal-dark",
        //mouseWheelPixels:"200px",
        scrollInertia: 0,
        callbacks: {
            onTotalScroll: function() {
                //分页调用
                if (sel == "#ChatAvatar .chatLineList") {
                    angular.element(ChatAvatar).scope().loadChatMore(true);
                }else if(sel == "#ChatAvatar .customerLineList"){
                    angular.element(ChatAvatar).scope().loadCustomerLineMore(true);
                }

            }
        }
    })
}

//滚动条美化 参数一:选择器，参数二：高度
function initScrollOrder(sel) {
    $(sel).mCustomScrollbar({
        autoHideScrollbar: true,
        theme: "minimal-dark",
        mouseWheelPixels: "200px",
        callbacks: {
            whileScrolling: function() {
                myCustomFn(this, sel);
            },
            onTotalScroll: function() {
                //分页调用
                if (sel == "#tab_lootOrder") {
                    angular.element(tab_lootOrder).scope().loadNewBiddocsMore();
                }

                if (sel == "#tab_pendOrder") {
                    angular.element(tab_pendOrder).scope().loadProcessOrdersMore();
                }

                if (sel == "#historyOrderList") {
                    angular.element(historyOrder).scope().loadHistoryorder();
                }

                if (sel == "#soudouContent .box") {
                    angular.element(soudouContent).scope().intitCostRecords('page');
                }

                if (sel == "#walletContent .box") {
                    angular.element(walletContent).scope().initPayRecords('page');
                }
            }

        }
    })
}

//日历方法 参数一：选择器，参数二：日期格式 
function initDateInput(selector, format) {

    setTimeout(function() {
        $(selector).datetimepicker({
            language: 'zh-CN',
            format: format,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })
    }, 500);
}

function walletDateInput(selector, format) {

    setTimeout(function() {
        $(selector).datetimepicker({
            format: format,
            endDate: new Date(new Date().getFullYear() + "-" + (new Date().getMonth() + 3)),
            initialDate: new Date(new Date().getFullYear() + "-" + (new Date().getMonth() + 1)),
            autoclose: true,
            startView: 3,
            minView: 3,
            language: "zh-CN",
            todayHighlight: false
        })
    }, 500);
}


//抢单列表返回顶部按钮,移动100px才显示
function myCustomFn(el, sel) {
    var $backTop = $("#backTop");
    if (el.mcs.top < -100) {
        $backTop.show();
        $backTop.on("click", function() {
            $(sel).mCustomScrollbar("scrollTo", "top", { scrollInertia: 500 });
        })
    } else {
        $backTop.hide();

    };
}

//左侧聊天区域横向拖动宽度变化
function bindResize(el) {
    if (!el) {
        return;
    }
    var els = el.style,
        x = 0;
    $(el).mousedown(function(e) {
        x = e.clientX - el.offsetWidth;
        el.setCapture ? (
            el.setCapture(),
            el.onmousemove = function(ev) {
                mouseMove(ev || event);
            },
            el.onmouseup = mouseUp
        ) : (
            $(document).on("mousemove", mouseMove).on("mouseup", mouseUp)
        );
        e.preventDefault();
    });

    function mouseMove(e) {

        els.width = e.clientX - x + 'px';
        if (parseInt(els.width) >= 220) {
            $("#chatWindow").css("margin-left", "220px");
            $("#ChatAvatar").css("width", "220px");
        } else if (parseInt(els.width) <= 62) {
            $("#chatWindow").css("margin-left", "62px")
            $("#ChatAvatar").css("width", "62px");
            $(".media-heading", "#ChatAvatar").css("padding-left", "5px");
        } else {
            $("#chatWindow").css("margin-left", els.width);
            $(".media-heading", "#ChatAvatar").css("padding-left", 0);

        }
        var $ChatAvatarWidth = $("#ChatAvatar").width() - 65;
        $(".media-heading", "#ChatAvatar").width($ChatAvatarWidth);
    }
    //停止事件
    function mouseUp() {
        //在支持 releaseCapture 做些东东
        el.releaseCapture ? (
            //释放焦点
            el.releaseCapture(),
            //移除事件
            el.onmousemove = el.onmouseup = null
        ) : (
            //卸载事件
            $(document).off("mousemove", mouseMove).off("mouseup", mouseUp)
        );
    }
}

//底部聊天区域纵向拖动高度变化
function bindChatResize(el) {
    if (!el) {
        return;
    }
    var els = el.style,
        y = 0;
    $(el).mousedown(function(e) {
        y = e.clientY + el.offsetHeight;
        el.setCapture ? (
            el.setCapture(),
            el.onmousemove = function(ev) {
                mouseMove(ev || event);
            },
            el.onmouseup = mouseUp
        ) : (
            $(document).on("mousemove", mouseMove).on("mouseup", mouseUp)
        );
        //e.preventDefault();
    });
    $("#chartInput").mousedown(function(e) {
        e.stopPropagation();
    });

    $(".chatMenu")[0].onmousedown = new Function("return false");
    $(".chatMenu")[0].onmouseup = new Function("return true");

    function mouseMove(e) {
        var $chatWindowHei = $("#chatWindow").outerHeight(true);
        var $chatSendMsgHei = $(".chatSendMsg").outerHeight(true);
        var $chatHeaderHei = $(".chatList .header").outerHeight(true);
        els.height = y - e.clientY + 'px';
        if (parseInt(els.height) >= 390) {
            $(".chatSendMsg").css("height", 390 + "px");
            $("#chartInput").css("height", 346 + "px");
            $("#ordersNoticeBar").css("bottom", 388 + "px");
        } else if (parseInt(els.height) <= 139) {
            $(".chatSendMsg").css("height", 139 + "px");
            $("#chartInput").css("height", 96 + "px");
            $("#ordersNoticeBar").css("bottom", 137 + "px");
        } else {
            $(".chatList").css("height", $chatWindowHei - $chatSendMsgHei);
            $(".chatSendMsg").css("height", els.height);
            $("#chartInput").css("height", y - e.clientY - 43);
            $(".tab-pane", "#chatBody").css("height", $chatWindowHei - $chatSendMsgHei - $chatHeaderHei);
            $("#ordersNoticeBar").css("bottom", parseInt(els.height) - 2);
        }
    }
    //停止事件
    function mouseUp() {
        //在支持 releaseCapture 做些东东
        el.releaseCapture ? (
            //释放焦点
            el.releaseCapture(),
            //移除事件
            el.onmousemove = el.onmouseup = null
        ) : (
            //卸载事件
            $(document).off("mousemove", mouseMove).off("mouseup", mouseUp)
        );
    }
}

//动态加载JS
function createJs(url, name) {
    var scriptId = document.getElementById(name);
    if (scriptId) {
        scriptId.remove();
    }

    var oBODY = document.getElementsByTagName('BODY')[0];
    var oScript = document.createElement("script");
    oScript.type = "text/javascript";
    oScript.src = url;
    oScript.id = name;
    oBODY.appendChild(oScript);
}

//桌面通知按钮显示
function notifyPermission() {
    if (!window.Notification) {
        return;
    }
    if (Notification.permission == 'denied') {
        alert('为了不影响你的抢单业务，请设置浏览器允许对此页面进行消息通知，如您不清楚如何操作，请尽快联系客服！');
        return;
    }
    return Notification.permission;
    //询问用户权限，granted代表允许，denied代表禁止，default代表默认（用户没有选择权限）

}

//桌面通知调用共通方法
//bodyMsg    必须参数，弹出框内显示的信息
function desktopNotify(bodyMsg, icon) {
    if (!window.Notification) {
        return;
    }
    var body = bodyMsg;
    icon = "resource/img/notify_icon.jpg";
    var tag = 1;
    var title = "车后邦小秘书";
    if (!("Notification" in window)) {
        return;
    } else if (Notification.permission === "granted") {
        createNotifyObject(title, body, icon, tag);
    } else if (Notification.permission !== 'denied') {
        //询问用户权限，granted代表允许，denied代表禁止，default代表默认（用户没有选择权限）
        Notification.requestPermission(function(permission) {
            var permissionTag = {
                index: 1
            };

            if (permission === "granted") {
                permissionTag.index = 2;
                createNotifyObject(title, body, icon, tag);
            } else if (permission === 'denied') {
                permissionTag.index = 3;
                alert('为了不影响你的抢单业务，请设置浏览器允许对此页面进行消息通知，如您不清楚如何操作，请尽快联系客服！');

            } else if (permission === 'default') {
                permissionTag.index = 4;
                alert('请点击此页面的开启消息通知按钮，并允许浏览器的消息通知！这样做可以让您及时收到新的订单！');
            }
        });
    }

}

//创建Notification对象
function createNotifyObject(title, body, icon, tag) {
    var notification = new Notification(title, {
        body: body,
        icon: icon,
        tag: tag
    });
    notification.onclick = function() {
        window.focus();
    };
}


//通知同一账号的卖家下线
var closeSameClient = function(sellerId, reason) {
    if (reason == 'oneUser') {
        alert("您的账户已经在另一地点登录，您被迫下线，请确认是否是您本人操作，如果不是则您的账号存在风险，请及时修改登录密码，保障信息安全！");
        top.location = "/index.html";
    } else {
        //自动关闭当前页
        self.close();
    }
};

//待处理订单转换订单状态
function orderstatusFn(status) {
    switch (status) {
        case "CREATE":
        case "MODIFY":
        case "RETURN_UNCONFIRM":
        case "RETURN_DISAGREE":
        case "RETURN_APPEAL":
        case 'RETURN_PROCESSING':
            return "TEMP";

        case "PAID":
        case "DELIVERED":
        case "RETURN_AGREE":
        case "RETURN_DELIVERED":
        case "RETURN_UNPAID":
            return "TRADING";

        case "CANCEL":
        case "FINISH":
        case "COMPLETED":
        case "RETURN_FINISH":
        case "RETURN_APPEAL_FINISH":
            return "FINISH";
    }
}

//订单详情转换文字显示状态
function getorderinfotatusFn(status, logistics_type, trade_money, freeze_status) {

    switch (status) {
        case "PLACE":
            return "对方通知你下单，快去处理吧！"; 

        case "CREATE":
            return "你已下单，等待对方付款。"; 

        case "MODIFY":
            return "对方退回订单，等待你修改并重新下单。"; 

        case "CANCEL":
            return "对方已取消订单，本次交易结束。";

        case "PAID":
            if (freeze_status == 'RETURN_FREEZE') {
                return "对方申请退货，平台正在处理，本订单同时被冻结";
            } else if (freeze_status == 'APPROVAL_FREEZE') {
                return "平台已经冻结此订单，详情请咨询客服";
            } else {
                if (logistics_type == "pick_up") {
                    return "等待对方上门提货。";
                } else if (logistics_type == "logistics") {
                    return "对方已付款，等待你发货。";
                }
            }
            break;

        case "DELIVERED":
            if (freeze_status == 'RETURN_FREEZE') {
                return "对方申请退货，平台正在处理，本订单同时被冻结";
            } else if (freeze_status == 'APPROVAL_FREEZE') {
                return "平台已经冻结此订单，详情请咨询客服";
            } else {
                return "你已发货，等待对方收货。";
            }
            break;

        case "FINISH":
            if (freeze_status == 'RETURN_FREEZE') {
                return "对方申请退货，平台正在处理，本订单同时被冻结";
            } else if (freeze_status == 'APPROVAL_FREEZE') {
                return "平台已经冻结此订单，详情请咨询客服";
            } else {
                if (logistics_type == "pick_up") {
                    return "对方已提货，明天结算款项。"; 
                } else if (logistics_type == "logistics") {
                    return "对方已收货，明天结算款项。"; 
                }
            }
            break;

        case "COMPLETED":
            if (trade_money == undefined) {
                return "订单款项已结算，请查收你的钱包，本次交易完成。";
            } else {
                return "订单款项 " + trade_money + " 元 已结算，请查收你的钱包，本次交易完成。";
            }
            break;

        case "RETURN_UNCONFIRM":
            if (logistics_type == "logistics") {
                return "对方申请退货（第三方物流），等待你处理。"; 
            } else {
                return "对方申请退货（双方协商的其他方式），等待你处理。"; 
            }
            break;

        case "RETURN_AGREE":
            if (logistics_type == "logistics") {
                return "你已同意退货，等待对方退货。"; 
            } else {
                return "你已同意退货，使用协商的其他方式处理。"; 
            }
            break;

        case "RETURN_DELIVERED":
            if (logistics_type == "logistics") {
                return "对方已发出退货，等待你收货。"; 
            } else {
                return "请按照协商使用的其他退货方式完成退货"; 
            }
            break;

        case "RETURN_DISAGREE":
            return "你已驳回对方的退货申请。"; 

        case "RETURN_APPEAL":
            return "对方向平台提出申诉，平台介入处理。";         

        case "RETURN_UNPAID": //七天外
            return "退货完成，对方等待你退款。"; 

        case "RETURN_PROCESSING": //七天内
            return "对方申请退货，平台正在处理，本订单同时被冻结！"; 

        case "RETURN_APPEAL_FINISH":
            return "平台协商处理完成，本次交易结束。"; 

        case "RETURN_FINISH":
            return "退货的款项 " + trade_money + " 元 已成功退还对方！"; 
    }
}

//code码返回错误提示
function errCode(code) {
    switch (code) {
        case 180001:
            return "因系统原因暂无法抢单，车后邦正全力修复，请稍后刷新再试";

        case 180002:
            return "您的账号仍在审核中，暂时不能抢单！如需加快进度，可联系车后邦客服";

        case 180003:
            return "嗖豆余额不足，抢单未成功！请前往“我的钱包”购买嗖豆";

        case 180004:
            return "您的当前账号已在别处登录，请确认是否为您本人的操作";

        case 180005:
            return "车后邦找不到该商品单号，请检查单号后再试试";

        case 180006:
            return "信息有误或不符，请检查后再试试";

        case 180007:
            return "当前操作的安全验证未通过，请刷新重试";

        case 180008:
            return "交易环境创建未成功，请刷新再试";

        case 180009:
            return "交易环境创建未成功，请刷新再试";

        case 180010:
            return "车后邦安全提醒您：您还没有设置交易密码";

        case 180011:
            return "车后邦安全提醒您：交易密码有误，请检查后再试";

        case 180012:
            return "账号登录密码错误";

        case 180015:
            return "抢慢了，该订单被抢走了！";

        case 180016:
            return "支付已失效（规定时间内没有支付完成）！";

        case 180018:
            return "车后邦安全提醒您：请绑定微信openid！";

        case 180019:
            return "主账号或子账号已抢单，不可重复抢单！";

        case 180021:
            return "短信验证码错误，请确认后重新提交";

        default:
            return "<p>服务器刚刚走神了，</p><p>请刷新再试试。。。</p>";
    }
}

//初始化本地存储json数据
function localSaveJsonStorage(data) {
    var init = {};
    init.seller_id = data.curUserId;
    init.isAdmin = data.isCompanyAdmin;
    init.company_id = data.companyInfo.org_id;
    var str = JSON.stringify(init);
    localStorage.setItem("inito", str);
}

//读取初始化存储的json数据
function localLoadJsonStorage(key) {
    var str = localStorage.getItem("inito");
    var data = JSON.parse(str);
    return data[key];
}

//生成二维码
function createQrcode(url) {
    jQuery('#qrcode').html('');
    jQuery('#qrcode').qrcode({ width: 190, height: 190, text: url });
}

//控制点击按钮不允许连续操作
function repeatClick() {
    var newDate = new Date().getTime();
    var oldDate = localStorage.getItem('repeatClickDate')

    if (oldDate && newDate - oldDate < 1000) {
        alert("您的操作太频繁，请稍后再试");
        return true;
    }

    localStorage.setItem('repeatClickDate', newDate);
}

//浮点计算
Math.formatFloat = function(f, digit) { 
    var m = Math.pow(10, digit); 
    return parseInt(f * m, 10) / m; 
};


/**************************************************************
 * 订单socket参数说明
 * @param curUserId  初始化公司信息curUserId
 * @param 
 ***************************************************************/
function socketOrder(curUserId,orgId){
    // Variable：变量定义//////////////////////////////////////////////////////////////////////////////////////////////
    var noticeSellerId=curUserId;
    var noticeUserType=2;       // 买家端设定为1 卖家端为2
    var noticeProto={
        protoHeader:{title:'car2go_seller_notice',userId:noticeSellerId,userType:noticeUserType}, // 协议结构
        protoBody:'',
        protoEnd:''};
    var noticeSocket;

    // Config:client端配置参数设定 （优化：初始化时ajax异步从服务器端获取，不显示在客户端js中）////////////////////////
    var noticeSocketOpts={
        reconnection:true,                // 自动重连
        reconnectionDelay:1000,           // 重连间隔0.5秒
        reconnectionDelayMax:5000,        // 最多5s连一次
        reconnectionAttempts:5,           // 允许5次重连
        timeout:15000                     // 连接超时,重连超过15s则断开连接
    };

    var protoName={
        // 上行协议
        proto_up_login:'proto_up_login',                               // 登录
        // 下行协议
        proto_down_loginresult:'proto_down_loginresult',               // 登录应答
        // 上行协议
        proto_up_newbiddoc_notice:'proto_up_newbiddoc_notice',         // 通知客户端有新的匹配订单
        // 下行协议
        proto_down_newbiddoc_notice:'proto_down_newbiddoc_notice',     // 通知客户端有新的匹配订单应答
        // 下行协议
        proto_down_close_biddoc:'proto_down_close_biddoc',             // 通知卖家该订单已抢完
        // 下行协议
        proto_down_close_client:'proto_down_close_client',              // 通知同一账号的卖家下线
        // 下行协议                                                   
        proto_down_new_trading_order:'proto_down_new_trading_order',    // 通知客户端有待处理订单
        //下行协议
        proto_down_new_his_order:'proto_down_new_his_order',            //通知客户端有新的历史交易订单
        //下行协议
        proto_down_expire_order:'proto_down_expire_order'               //通知客户端更新过期订单

    };

    var keepPageAlive;
    var startKeepTime;

    // 守护页面激活状态每10s检查一次
    function startKeepAlive() {
        var keepDate = new Date();
        startKeepTime = keepDate.getTime();
        keepPageAlive = window.setInterval(function () {
            var nowDate = new Date();
            var nowKeepTime = nowDate.getTime();
            var pauseTime = (nowKeepTime - startKeepTime);

            // 超过3分钟自动断开重连
            if (pauseTime > 180000) {
                noticeSocket.disconnect();
                noticeSocket.connect();
            }

            startKeepTime = nowKeepTime;

            // 回收
            nowDate = null;
            nowKeepTime = null;
            pauseTime = null;
        }, 10000);   // 10s监测一次
        keepDate = null;
    }

    // Socket：socket监听处理//////////////////////////////////////////////////////////////////////////////////////////
    noticeSocket=io.connect(connectOrder,noticeSocketOpts); // 本地

    // 监听连接状态
    noticeSocket.on("connecting",function(){
        console.log("连接到聊天服务器…");
    });

    // 连接断开
    noticeSocket.on("disconnect",function(){
        console.log("连接断开，开始重连…");
    });

    // 重连
    noticeSocket.on("reconnecting",function(number){
        console.log("第"+number+"次重连中…");
    });

    // 重连成功
    noticeSocket.on("reconnect",function(number){
        console.log("第"+number+"次重连成功！");
        
        //checkSessionEnable(); //此接口未做
        // Justin 12.29 抢单异常情况下：session失效场合弹出刷新网页提示框 end
    });

    // 重连失败
    noticeSocket.on("reconnect_failed",function(){
        alert("由于网络状况不好，暂时无法连接到服务器，请检查网络！");
        // Justin 刷新整个页面重新连接 12.25 start
        top.location.reload();
        // Justin 刷新整个页面重新连接 12.25 end
    });

    // 连接成功
    noticeSocket.on("connect",function(){
        // 发送登录请求
        noticeProto.protoBody={protoName:protoName.proto_up_login, login_time:new Date().getTime(), org_id:orgId};
        noticeSocket.emit(protoName.proto_up_login,noticeProto);
        noticeProto.protoBody=null;
    });

    // 登录应答
    noticeSocket.on(protoName.proto_down_loginresult,function(recProto){
        if(recProto.errorCode)
        {
            console.error(recProto.errorCode);
        }
        else
        {
            // 登录成功 启动状态守护
            startKeepAlive(new Date().getTime());
        }
    });

    // 接收新标书通知消息
    noticeSocket.on(protoName.proto_down_newbiddoc_notice,function(recProto){
        if(recProto.errorCode)
        {
            console.error(recProto.errorCode);
        }
        else
        {
            console.log('新标书通知',recProto);
            //console.log(new Date());
            var biddocInfo = recProto.biddocInfo;

            //指定不同的提示音
            //var biddocsBell;
            if (biddocInfo.isPartner == 1 && biddocInfo.biddoc_type != 2) {
                //biddocsBell='resource/radio/biddocsBell_partner.mp3';
                $("#music").attr("src",'resource/radio/biddocsBell_partner.mp3');
            }else if(biddocInfo.isPartner == 1 && biddocInfo.biddoc_type == 2){
                //biddocsBell='resource/radio/biddocsBell_one2one.mp3';
                $("#music").attr("src",'resource/radio/biddocsBell_one2one.mp3');
            }else{
                //biddocsBell = 'resource/radio/biddocsBell_1.mp3';
                $("#music").attr("src",'resource/radio/biddocsBell_1.mp3');
            }

            //播放声音
            //$("#audio").attr("src",biddocsBell);

            //桌面通知
            desktopNotify("车后邦来新的订单啦！先抢先得喔！！！！", "resource/img/notify_icon.jpg");

            // 这里更新今日订单数字
            angular.element(indexController).scope().updateTodayBiddocNum();

            // Justin 12.28 接收到订单通知后，发送应答通知 start
            var data={
                seller_id:biddocInfo.seller_id,
                company_id:biddocInfo.company_id,
                biddoc_id:biddocInfo.biddoc_id
            };
            noticeSocket.emit(protoName.proto_up_newbiddoc_notice,{result:'success',data:data});
            // Justin 12.28 接收到订单通知后，发送应答通知 end

            if(window.location.hash == '#/order'){
                // 在这里更新客户端订单
                angular.element(tab_lootOrder).scope().updatePipeiBiddoc(biddocInfo);
            }else{
                //提示新订单红点
                angular.element(indexController).scope().updateBiddocDotFn();
            }

        }
    });

    //通知卖家订单已抢完
    noticeSocket.on(protoName.proto_down_close_biddoc,function(recProto){
        if(recProto.errorCode){
            console.error(recProto.errorCode);
        }else{
            if(window.location.hash == '#/order'){
                var biddocId = recProto.biddocId;
                //更新抢单按钮状态
                angular.element(tab_lootOrder).scope().updateBiddocStatus(biddocId);
            }
        }
    });

    //通知已过期订单
    noticeSocket.on(protoName.proto_down_expire_order,function(recProto){
        if(recProto.errorCode){
            console.error(recProto.errorCode);
        }else{
            if(window.location.hash == '#/order'){
                var biddocIds = recProto.biddocIds;
                //更新抢单按钮状态
                angular.element(tab_lootOrder).scope().updateBiddocExpireStatus(biddocIds);
            }
        }
    });

    //通知同一账号的卖家下线
    noticeSocket.on(protoName.proto_down_close_client,function(recProto){
        if(recProto.errorCode){
            console.error(recProto.errorCode);
        }else{
            var sellerId = recProto.sellerId;
            var reason = recProto.reason;
            closeSameClient(sellerId,reason);
        }
    });

    //通知客户端有待处理订单
    noticeSocket.on(protoName.proto_down_new_trading_order,function(recProto){
        if(recProto.errorCode){
            console.error(recProto.errorCode);
        }else{
            console.log('待处理订单通知',recProto);
            if(window.location.hash == '#/order'){
                angular.element(tab_pendOrder).scope().loadProcessOrdersMore(recProto);
            }
        }
    });

    //通知客户端有新的历史交易订单 下行协议
    noticeSocket.on(protoName.proto_down_new_his_order,function(recProto){
        if(recProto.errorCode){
            console.error(recProto.errorCode);
        }else{
            console.log('历史交易订单通知',recProto);
            if(window.location.hash == '#/historyOrder'){
                angular.element(historyOrderList).scope().historyOrderRefresh();
            }else{
                //提示新订单红点
                angular.element(indexController).scope().updateHistoryDotFn();
            }
        }
    });

}


/**
 * Created by Jason on 2016/5/5.
 * 聊天通信
 */

// chat callback
var chatCallback = null;
// Chat socket
var chatSocket = null;
// 用户ID
var curUserId = '';

// 协议定义
var chatProto = {
    // 协议结构
    protoHeader: {title: 'car2go_chat', userId: '', userType: 2},
    protoBody: {},
    protoEnd: ''
};
var chatProtoName = {
    proto_up_login: 'proto_up_login',
    proto_down_loginresult: 'proto_down_loginresult',
    proto_up_chat_property: 'proto_up_chat_property',
    proto_down_chat_property: 'proto_down_chat_property',
    proto_up_unreadmsg: 'proto_up_unreadmsg',
    proto_down_unreadmsg: 'proto_down_unreadmsg',
    proto_up_rep_unreadmsg: 'proto_up_rep_unreadmsg',
    proto_down_readmsg: 'proto_down_readmsg',
    proto_up_msg: 'proto_up_msg',
    proto_down_rep_msg: 'proto_down_rep_msg',
    proto_down_notice: 'proto_down_notice',
    proto_up_hismsg: 'proto_up_hismsg',
    proto_down_hismsg: 'proto_down_hismsg'
};

// 初始化 Socket
function initChatSocket(userId, callback) {
    if (!chatSocket) {
        // Socket 配置
        var socketOpts = {
            reconnection: true,           // 自动重连
            reconnectionDelay: 1000,      // 重连间隔0.5秒
            reconnectionDelayMax: 5000,   // 最多5s连一次
            reconnectionAttempts: 5,      // 允许5次重连
            timeout: 15000                // 连接超时,重连超过15s则断开连接
        };

        var keepPageAlive;
        var startKeepTime;

        // 守护页面激活状态每10s检查一次
        function startKeepAlive() {
            var keepDate = new Date();
            startKeepTime = keepDate.getTime();
            keepPageAlive = window.setInterval(function () {
                var nowDate = new Date();
                var nowKeepTime = nowDate.getTime();
                var pauseTime = (nowKeepTime - startKeepTime);

                // 超过3分钟自动断开重连
                if (pauseTime > 180000) {
                    chatSocket.disconnect();
                    chatSocket.connect();
                }

                startKeepTime = nowKeepTime;

                // 回收
                nowDate = null;
                nowKeepTime = null;
                pauseTime = null;
            }, 10000);   // 10s监测一次
            keepDate = null;
        }

        // 用户ID
        curUserId = userId;
        // 协议头
        chatProto.protoHeader.userId = userId;
        // 连接
        chatSocket = io.connect(connectChat, socketOpts);

        // 监听连接状态
        chatSocket.on("connecting", function () {
            console.log("监听连接状态");
        });

        // 连接断开
        chatSocket.on("disconnect", function () {
            //showWorningMsg("连接断开，开始重连…");
            console.log("连接断开，开始重连…");
            window.clearInterval(keepPageAlive);
        });

        // 重连
        chatSocket.on("reconnecting", function (number) {
            //showWorningMsg("第" + number + "次重连中…");
            console.log("第" + number + "次重连中…");
        });

        // 重连成功
        chatSocket.on("reconnect", function (number) {
            //showWorningMsg("第" + number + "次重连成功！");
            console.log("第" + number + "次重连成功！");
            // hideWorningMsg();
        });

        // 重连失败
        chatSocket.on("reconnect_failed", function () {
            //showWorningMsg("由于网络异常，暂时无法连接到服务器！");
            console.log("由于网络异常，暂时无法连接到服务器！");
        });

        // 连接成功
        chatSocket.on("connect", function () {
            // 发送登录请求
            chatProto.protoBody = {
                chatProtoName: chatProtoName.proto_up_login,
                login_time: Date.now()
            };

            chatSocket.emit(chatProtoName.proto_up_login, chatProto);
            chatProto.protoBody = null;
        });

        // 登录应答
        chatSocket.on(chatProtoName.proto_down_loginresult, function (recProto) {
            if (recProto.errorCode) {
                console.error(recProto.errorCode);
            } else {
                // 登录成功 启动状态守护
                startKeepAlive(new Date().getTime());

                // 回调函数
                if (!chatCallback) {
                    chatCallback = callback;
                }
                chatCallback();
            }
        });

        // 会话属性应答
        chatSocket.on(chatProtoName.proto_down_chat_property, function (recProto) {
            if (recProto.errorCode) {
                console.error(recProto.errorCode);
            } else if (chatCallback) {
                chatCallback(chatProtoName.proto_down_chat_property, recProto);
            }
        });

        // 未读消息应答
        chatSocket.on(chatProtoName.proto_down_unreadmsg, function (recProto) {
            if (recProto.errorCode) {
                console.error(recProto.errorCode);
            } else if (chatCallback) {
                chatCallback(chatProtoName.proto_down_unreadmsg, recProto);
            }
        });

        // 未读消息已读通知
        chatSocket.on(chatProtoName.proto_down_readmsg, function (recProto) {
            if (recProto.errorCode) {
                console.error(recProto.errorCode);
            } else {
                chatCallback(chatProtoName.proto_down_readmsg, recProto);
            }
        });

        // 接收文字&图片消息应答
        chatSocket.on(chatProtoName.proto_down_rep_msg, function (recProto) {
            if (recProto.errorCode) {
                console.error(recProto.errorCode);
            } else if (chatCallback) {
                chatCallback(chatProtoName.proto_down_rep_msg, recProto);
            }
        });

        // 新消息通知
        chatSocket.on(chatProtoName.proto_down_notice, function (recProto) {
            if (chatCallback) {
                chatCallback(chatProtoName.proto_down_notice, recProto);
            }
        });

        // 历史消息应答
        chatSocket.on(chatProtoName.proto_down_hismsg, function (recProto) {
            if (recProto.errorCode) {
                console.error(recProto.errorCode);
            } else if (chatCallback) {
                chatCallback(chatProtoName.proto_down_hismsg, recProto);
            }
        });
    } else {
        // 回调函数
        chatCallback = callback;
        chatCallback();
    }
}

/**
 * 请求会话属性
 * @param arrChatNum        聊天编号
 * @param getUnreadMsgFlag  获取未读消息标识
 * @param sendHelloFlag     获取未读消息标识
 */
function getChatProperty(arrChatNum, getUnreadMsgFlag, sendHelloFlag) {
    chatProto.protoBody = {
        chatProtoName: chatProtoName.proto_up_chat_property,
        chatNum: arrChatNum,
        getUnreadMsgFlag: getUnreadMsgFlag,
        sendHelloFlag: sendHelloFlag
    };
    // 接单卖家请求
    chatSocket.emit(chatProtoName.proto_up_chat_property, chatProto);
    chatProto.protoBody = null;
}

/**
 * 发送消息
 * @param msg       消息内容
 * @param msgType   消息类型
 * @param curChat   会话数据
 * @param visible   可见标识(0均可见;1买家;2卖家)
 */
function sendMsg(msg, msgType, curChat, visible, msg_by ) {
    chatProto.protoBody = {
        protoName: chatProtoName.proto_up_msg,
        biddocId: curChat.biddoc_id,
        sendId: curUserId,
        recvId: curChat.buyer_id,
        fromTo: fromTo,
        chatNum: curChat.chat_code,
        serialNum: getCurSerialNum(curChat.chat_code),
        msgType: msgType,
        visible: visible,
        msgBody: msg,
        msgBy: msg_by
    };
    chatSocket.emit(chatProtoName.proto_up_msg, chatProto);
    chatProto.protoBody = null;
}

/**
 * 请求未读消息
 * @param chatNum  聊天编号
 */
function getUnreadMsg(chatNum) {
    chatProto.protoBody = {
        chatProtoName: chatProtoName.proto_up_unreadmsg,
        chatNum: chatNum
    };
    chatSocket.emit(chatProtoName.proto_up_unreadmsg, chatProto);
    chatProto.protoBody = null;
}

/**
 * 未读消息应答
 * @param curChat   会话数据
 * @param arrMsgId  消息ID列表
 */
function unreadMsgResponse(curChat, arrMsgId) {
    chatProto.protoBody = {
        chatProtoName: chatProtoName.proto_up_rep_unreadmsg,
        chatTargetId: curChat.buyer_id,
        chatNum: curChat.chat_code,
        arrMsgId: arrMsgId
    };
    // 请求未读消息
    chatSocket.emit(chatProtoName.proto_up_rep_unreadmsg, chatProto);
    chatProto.protoBody = null;
}

/**
 * 获取历史消息
 * @param chatNum   聊天编号
 */
function getHisMsg(chatNum) {
    chatProto.protoBody = {
        chatProtoName: chatProtoName.proto_up_hismsg,
        serialNum: curOrderChat[chatNum].hisSerialNum + curOrderChat[chatNum].firstGetHistory--,
        chatNum: chatNum
    };
    chatSocket.emit(chatProtoName.proto_up_hismsg, chatProto);
    chatProto.protoBody = null;
}
