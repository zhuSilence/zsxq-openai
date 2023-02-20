#!/usr/bin/env node

// 引入request模块
var request = require("request");

console.log("hello nodejs")

var arguments = process.argv

console.log("脚本位置: " + arguments[1])
console.log("任务参数: " + arguments[2])
console.log("分片序号: " + arguments[3])
console.log("分片总数: " + arguments[4])

// 对应星球的待我回答地址
const ZSXQ_UNANSWER_URL = "https://api.zsxq.com/v2/groups/{对应的 groupsID}/topics?scope=unanswered_questions&count=20";
// 提问回答接口地址前缀
const ZSXQ_ANSWER_URL = "https://api.zsxq.com/v2/topics/";
// OpenAi 接口地址
const OPEN_AI_URL = "https://api.openai.com/v1/completions";
// OpenAi 的 API_KEY
const API_KEY = "sk-xxxxx";

// 是否只通知提问者，false 表示通知所以群友，true 表示只通知提问者
const silenced = false;

// 登录后的 cookie
const cookie = "";

// 使用请求Node.js模块处理获取请求的示例
var options = {
    url: ZSXQ_UNANSWER_URL,
    headers: {
        'accept': 'application/json, text/plain, */*',
        'cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'x-timestamp': Math.floor(Date.now() / 1000),
    }
};

var topicId;

// 获取提问回调
function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
        let json = JSON.parse(body);
        if (!json.succeeded) {
            console.log("succeeded false")
            process.exit(0)
        }
        //{"succeeded":true,"resp_data":{"topics":[{"topic_id":412851145544158,"group":{"group_id":48412124258488,"name":"浅析计算广告","type":"pay"},"type":"q&a","question":{"owner":{"user_id":552158114154,"name":"子悠","avatar_url":"https://images.zsxq.com/Fq1EW3xpwPMTl1Z8rYEdN2nyHR5v?e=1680278399&token=kIxbL07-8jAj8w1n4s9zv64FuZZNEATmlU_Vm6zD:J3OPG9HZaIW71Qx-TX1gJviXlSs=","description":"B站浅析计算广告博主，Java极客技术作者，多年国内OTT广告行业从业者，品牌广告，程序化广告实践者。","location":"广东"},"questionee":{"user_id":548241222882444,"name":"小Chat","avatar_url":"https://images.zsxq.com/Fkd6zmOQmrxBUhdv1nlkC-VbS97d?e=1680278399&token=kIxbL07-8jAj8w1n4s9zv64FuZZNEATmlU_Vm6zD:pOob5skw6FG621iH4hPMb28A7-U=","location":"广东"},"text":"测试","expired":false,"anonymous":false,"owner_detail":{"questions_count":1,"join_time":"2021-01-10T10:18:24.238+0800"},"owner_location":"广东"},"answered":false,"likes_count":0,"rewards_count":0,"comments_count":0,"reading_count":1,"readers_count":1,"digested":false,"sticky":false,"create_time":"2023-02-19T11:14:49.231+0800","user_specific":{"liked":false,"subscribed":false}}]}}
        if (json.resp_data.topics.length > 0) {
            let length = json.resp_data.topics.length;
            for (let i = 0; i < length; i++) {
                let question = json.resp_data.topics[i].question;
                topicId = json.resp_data.topics[i].topic_id;
                console.log(topicId + ":" + question.text)
                let openRequestOption = {
                    url: OPEN_AI_URL,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + API_KEY,
                        "topicId": topicId
                    },
                    timeout: 120000,
                    body: {
                        "model": "text-davinci-003",
                        "prompt": question.text,
                        "max_tokens": 2000,
                        "temperature": 0.9
                    },
                    json: true
                };
                request.post(openRequestOption, completionsCallBack)
            }
        } else {
            console.log("topics empty")
            process.exit(0)
        }
    } else {
        console.log("get questions error")
        process.exit(-1)
    }
}

// 智能回答
function completionsCallBack(error, response, body) {
    if (!error && response.statusCode === 200) {
        if (null != body && body.choices.length > 0) {
            let reply = body.choices[0].text;
            console.log(response.request.headers.topicId + ":" + reply);
            if (null != reply && reply.length > 0) {
                // 回答问题并通知提问者
                let answerOptions = {
                    url: ZSXQ_ANSWER_URL + "/" + response.request.headers.topicId + "/answer",
                    headers: {
                        'accept': 'application/json, text/plain, */*',
                        'cookie': cookie,
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
                        'x-timestamp': Math.floor(Date.now() / 1000),
                    },
                    timeout: 12000,
                    body: {
                        "req_data": {
                            "image_ids": [],
                            "silenced": silenced,
                            "text": reply
                        }
                    },
                    json: true
                }
                request.post(answerOptions, answerCallBack)
            }
        }
    } else {
        console.log("get answer error")
        process.exit(-1)
    }
}

// 回答后调用
function answerCallBack(error, response, body) {
    if (response.statusCode === 200 && body.succeeded) {
        console.log(":智能回答成功");
        //process.exit(0)
    } else {
        console.log(":智能回答失败");
        //process.exit(-1)
    }
}

// 程序入口方法
request(options, callback);


