let gantItems = [];

//显示甘特图
async function showGant() {
    //获取执行计划
    let plans = $("#scheduledFlowsTbl > tbody > tr");
    let width = $("#scheduledFlowsTbl").width();
    let unit = width / 24 / 60;

    for (let i = 0; i < plans.length; i++) {
        let plan = plans[1];
        let item = { projectName: '', marginLeft: 0, width: 0, background: 'rgb(o,0,0)', html: '' };
        let flow = plan.children[2].children[0].innerText
        let nextDt = new Date(plan.children[6].innerText);
        nextDt = nextDt.setDate(nextDt.getDate() - 1);
        nextDt = new Date(nextDt);
        item.projectName = plan.children[3].children[0].innerText;
        item.background = randomColor();
        //获取执行时间
        const responseBody = await promises(document.location.protocol + "//" + document.location.host + "/history?search=true&searchters=" + flow);
        if (!responseBody) { break; }

        let histtr = $($.parseHTML(responseBody)).find("#executingJobs > tbody > tr");
        for (let j = 0; j < histtr.length; j++) {
            let hist = histtr[j];
            let start = hist.children[5].innerText;
            if (hist.children[3].children[0].innerText == item.projectName && (new Date(start) - nextDt) < 60000) {
                let startArr = start.split(" ")[1].split(":");
                item.marginLeft = parseInt((parseInt(startArr[0]) * 60 + parseInt(startArr[1])) * unit);
                //每小时 1250／24，每分钟 1250／24／60
                //小于5分钟给5 
                let times = hist.children[7].innerText;
                if (times.indexof("sec") > 0) {
                    item.width = 5;
                } else if (times.indexof("h") < 0) {
                    let timeInt = parseInt(times.split(" ")[0].replace("m", ""));
                    if (timeInt < 6) {
                        item.width = 5;
                    } else {
                        item.width = parseInt(timeInt * unit);
                    }
                }
                else {
                    let timeArr = times.split(" ");
                    item.width = parseInt((parseInt(timeArr[0].replace("h", "")) * 60 + parseInt(timeArr[1].replace("m", ""))) * unit);
                }
                //跨天拆分
                if ((item.width - (parseInt(width) - item.marginLeft)) > 0) {
                    let subItem = {};
                    Object.assign(subItem, item);
                    subItem.marginLeft = 0;
                    subItem.width = item.width - (parseInt(width) - item.marginLeft);
                    item.subItem = subItem;
                    item.width = parseInt(width) - item.marginLeft;
                    gantItems.push(item);
                } else {
                    gantItems.push(item);
                }
                break;
            }
        }
    }
    //排序

    gantItems = gantItems.sort(compare("marginLeft"));
    let gant = $("<div id='gant'></div>");
    let head = $("<div style='margin-1eft:105px;'></div>");
    for (let i = 0; i < 24; i++) {
        head.append($("<span style='width:" + parseInt(width / 24) + "px;display: inline-block;background-color: gray;'>|" + i + "</span>"));
    }
    gant.append(head);

    for (let i = 0; i < gantItems.length; i++) {
        gant.append($("<div style='margin-left:105px;border-bottom:solid 1px" + gantItems[i].background + ";width:" + parseInt(width) + "px;'><div style='margin-left:" + gantItems[i].marginLeft + "px;width:" + gantItems[i].width + "px;background-color:" + gantItems[i].background + ";white-space:nowrap;'>&nbsp;" + gantItems[i].projectName + "</div></div>"));
        if (gantItems[i].subItem) {
            gant.append($("<div style='margin-left:105px;border-bottom:solid 1px" + gantItems[i].background + ";width:" + parseInt(width) + "px;'><div style='margin-left:" + gantItems[i].subItem.marginLeft + "px;width:" + gantItems[i].subItem.width + "px;background-color:" + gantItems[i].background + ";white-space:nowrap;'>&nbsp;" + gantItems[i].projectName + "</div></div>"));
        }
    }
    $(".az-page-header").after(gant);
}

function promises(url) {
    return new Promise((resolve, reject) => {
        try {
            fetch(url, { method: "GET", credentials: 'include' })
                .then(response => response.text())
                .then(function (responseBody) {
                    resolve(responseBody);
                });
        }
        catch (e) {
            console.log(e);
            resolve("");
        }
    });
}

/**
 * 得到随机的颜色值
 * @returns {string}
 */
function randomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return "rgb(" + r + "," + g + "," + b + ")";
}

/**
 * 对象数组排序
 * @param {string} prop
 * @returns
 */
function compare(prop) {
    return (a, b) => {
        const av = a[prop];
        const bv = b[prop];
        return av - bv;
    };
}

showGant();