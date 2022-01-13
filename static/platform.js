var schedule;
var user_name;
var user_email;
var user_role;
var date_array = [];

var current_calendar_year;
var current_calendar_month;

function sidebar_clear() {
    var li = ["li_index", "li_addSchedule", "li_setting", "li_logout"]
    for (var i = 0; i < li.length; i++) {
        var item = document.getElementById(li[i]);
        item.setAttribute("class", "sidebar-li inactive")
    }
}

function area_clear() {
    var li = ["setting-area", "schedule-detail", "main-area", "sub-area", "add-new-task"]
    for (var i = 0; i < li.length; i++) {
        var item = document.getElementById(li[i]);
        document.getElementById(li[i]).style.setProperty("visibility", "hidden");
    }
}

function animation_reset() {
    var div = ["setting-area", "schedule-detail", "calendar_area", "task_area", "new-task-area"]
    for (var i = 0; i < div.length; i++) {
        var item = document.getElementById(div[i]);
        document.getElementById(div[i]).style.setProperty("animation", "none");
    }
}

function fetchSchedule() {

    var user_name = document.getElementById("user_name").innerText;

    var firebase_fetch = db.collection("schedule").doc(user_email);

    var task_group = document.getElementById("task_ul_group");

    firebase_fetch.get().then((doc) => {

        schedule = doc.data();
        var keyList = Object.keys(schedule);

        var item_div = document.getElementById("task_group");

        for (var i = 0; i < keyList.length; i++) {

            var data = schedule[keyList[i]];

            var item = document.createElement("a");
            item.setAttribute("class", "list-group-item list-group-item-action task_content_div");
            item.style.setProperty("cursor", "pointer");
            item.style.setProperty("margin-top", "10px");

            var content_div = document.createElement("div");
            content_div.setAttribute("class", "d-flex w-100 justify-content-between");

            var title = document.createElement("h5");
            title.setAttribute("class", "mb-1");
            title.innerText = data["title"];

            var small = document.createElement("small");
            small.innerText = data["start_time"];

            var p = document.createElement("p");
            p.setAttribute("class", "mb-1");
            p.innerText = data["detail"].split("<br>")[0].replace("<sp>", " ").replaceAll("<sp>", " ") + (data["detail"].split("<br>").length > 2 ? "..." : "");

            var outer_small = document.createElement("small");
            outer_small.innerText = data["start_time"] + " - " + data["end_time"];

            content_div.append(title);
            content_div.append(small);

            item.append(content_div);
            item.append(p);
            item.append(outer_small);

            item_div.append(item);

        }
    });
}

$.ajax({
    url: "./platform",
    type: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    success: function (data, status, xhr) {
        Swal.fire({
            icon: "info",
            text: "載入中...",
            customClass: {
                container: "position-absolute"
            },
            timer: 1500,
            timerProgressBar: true,
            didOpen: (() => {
                Swal.showLoading();
                var a = document.getElementById("user_name").innerText = data["username"];
                user_role = data["role"];
                user_name = data["username"];
                user_email = data["email"];
                init();
                fetchSchedule();
            })
        })
    },
    error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        window.location.reload();
    }
});

function init() {

    var date = new Date();
    current_calendar_year = date.getFullYear();
    current_calendar_month = date.getMonth() + 1;

    var table = document.getElementById("calendar");
    for (var i = 0; i < 6; i++) {
        date_array[i] = [];
        var tr = document.createElement("tr");
        for (var j = 0; j < 7; j++) {

            date_array[i][j] = 0;

            var td = document.createElement("td");

            td.setAttribute("id", i.toString() + "-" + j.toString());
            td.setAttribute("class", "calendar_area_enable");
            td.style.setProperty("position", "relative");
            td.style.setProperty("font-family", "Noto Sans");
            td.style.setProperty("padding", "1%");

            var span = document.createElement("span");
            span.setAttribute("id", "calendar-date-" + i.toString() + "-" + j.toString())
            span.style.setProperty("position", "absolute");
            span.style.setProperty("top", "5%");
            span.style.setProperty("left", "5%");

            var count = document.createElement("span");
            count.setAttribute("id", "calendar-count-" + i.toString() + "-" + j.toString())
            count.style.setProperty("position", "absolute");
            count.style.setProperty("left", "50%");
            count.style.setProperty("buttom", "0%");
            count.style.setProperty("font-size", "24pt");
            count.style.setProperty("font-weight", "bold");
            count.style.setProperty("white-space", "nowrap");
            count.style.setProperty("transform", "translate(-50% , 0%)");

            span.addEventListener("click", function (event) {
                var id = event.target.getAttribute("id").split("-")[2] + "-" + event.target.getAttribute("id").split("-")[3];
                console.log(id);
                if (event.target.innerText.length == 0) {
                    const toast = Swal.mixin({
                        toast: true,
                        timer: 1000,
                        showConfirmButton: false,
                    });
                    toast.fire({
                        icon: "info",
                        title: "沒有 task！",
                    });
                } else {
                    updateSubDiv(id);
                    area_clear();
                    document.getElementById("sub-area").style.setProperty("visibility", "visible");
                }
            });

            count.addEventListener("click", function (event) {
                var id = event.target.getAttribute("id").split("-")[2] + "-" + event.target.getAttribute("id").split("-")[3];
                console.log(id);
                if (event.target.innerText.length == 0) {
                    const toast = Swal.mixin({
                        toast: true,
                        timer: 1000,
                        showConfirmButton: false,
                    });
                    toast.fire({
                        icon: "info",
                        title: "沒有 task！",
                    });
                } else {
                    updateSubDiv(id);
                    area_clear();
                    document.getElementById("sub-area").style.setProperty("visibility", "visible");
                }
            });

            td.addEventListener("click", function (event) {
                var id = event.target.getAttribute("id");
                console.log(id);
                console.log(document.getElementById("calendar-count-" + id).innerText.length);
                if (document.getElementById("calendar-count-" + id).innerText.length == 0) {
                    const toast = Swal.mixin({
                        toast: true,
                        timer: 1000,
                        showConfirmButton: false,
                    });
                    toast.fire({
                        icon: "info",
                        title: "沒有 task！",
                    });
                } else {
                    updateSubDiv(id);
                    area_clear();
                    document.getElementById("sub-area").style.setProperty("visibility", "visible");
                }
            });

            td.appendChild(span);
            td.appendChild(count);

            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    var index = document.getElementById("li_index");
    index.addEventListener("click", function () {
        window.location.reload();
    });

    var addtask = document.getElementById("li_addSchedule");
    addtask.addEventListener("click", function () {
        animation_reset();
        sidebar_clear();
        area_clear();
        addtask.setAttribute("class", "sidebar-li active");
        document.getElementById("add-new-task").style.setProperty("visibility", "visible");
        document.getElementById("new-task-area").style.setProperty("animation", "down-slidein 1.5s");
    });

    var setting = document.getElementById("li_setting");
    setting.addEventListener("click", function() {
       animation_reset();
       sidebar_clear();
       area_clear();
       setting.setAttribute("class", "sidebar-li active");
       document.getElementById("setting-area").style.setProperty("visibility", "visible");
       document.getElementById("setting-area").style.setProperty("animation", "down-slidein 1s");
    })

    var logout = document.getElementById("li_logout");
    logout.addEventListener("click", logout_func);

    var next_page = document.getElementById("next-page");
    next_page.addEventListener("click", function () {
        current_calendar_month += 1;
        drawCalendarNumber();
        drawCalendarTaskNumber();
        drawCalendarTitle();
        Swal.fire({
            text: "載入中...",
            target: "#calendar_area",
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            customClass: {
                container: "position-absolute"
            },
            didOpen: () => {
                Swal.showLoading();
            }
        })
    });

    var prev_page = document.getElementById("prev-page");
    prev_page.addEventListener("click", function () {
        current_calendar_month -= 1;
        drawCalendarNumber();
        drawCalendarTaskNumber();
        drawCalendarTitle();
        Swal.fire({
            text: "載入中...",
            timer: 1500,
            timerProgressBar: true,
            target: "#calendar_area",
            showConfirmButton: false,
            customClass: {
                container: "position-absolute"
            },
            didOpen: () => {
                Swal.showLoading();
            }
        })
    });

    var schedule_detail_delete_button = document.getElementById("detail_button");
    schedule_detail_delete_button.addEventListener("click", function (event) {
        let delete_id = event.target.getAttribute("value").toString();
        Swal.fire({
            title: "確定要刪除這筆嗎",
            confirmButtonText: '刪除',
            showDenyButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "刪除中",
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        let user_schedule = db.collection("schedule").doc(user_email);
                        console.log(delete_id);
                        let remove = user_schedule.update({
                            [delete_id]: firebase.firestore.FieldValue.delete()
                        }).then(() => {
                            Swal.fire({
                                icon: "success",
                                title: "刪除成功",
                                timer: 1500
                            }).then(() => {
                                window.location.href = "./platform";
                            });
                        })
                    }
                })
            }
        })
    });

    var modify_name_name = document.getElementById("btn_modify_name").addEventListener("click", async function(event){
        const step = ['1', '2'];
        const swalQueueStep = Swal.mixin({
            confirmButtonText: "OK",
            cancelButtonText: "回復上一動",
            progressSteps: step,
            input: 'text',
            inputAttributes : {
                required: true
            },
            reverseButtons: true,
            validationMessage: "請完成這個動作"
        });
        const values = ["", "", ""]
        const step_done = [false, false, false]
        let currentStep
        for(currentStep = 0; currentStep < 3;) {
            let result
            if(currentStep == 0){
                result = await swalQueueStep.fire({
                    title: "請輸入要更改的名稱",
                    inputValue: values[0],
                    currentProgressStep: currentStep,
                    showCancelButton: currentStep > 0,
                    preConfirm: async function(value) {
                        await db.collection("schedule").doc(value).get().then((doc) => {
                            if(doc.exists){
                                Swal.showValidationMessage("這個名稱已經被取走了 QQ");
                            }else{
                                step_done[0] = true;
                            }
                        });
                    }
                })
            }else if(currentStep == 1){
                result = await swalQueueStep.fire({
                    title: "嗨，" + values[0] + "，請輸入這隻帳號的密碼",
                    currentProgressStep: currentStep,
                    showCancelButton: currentStep > 0,
                    input: 'password',
                    preConfirm: async function(value) {
                        await app.auth().signInWithEmailAndPassword(user_email, value).then(async() => {
                            await db.collection("user").doc(user_email).update({
                                username: values[0]
                            }).then(() => {
                                step_done[1] = true;
                            }).catch((error) => {
                                var errorCode = error.code;
                                var errorMessage = error.message;
                                console.log(errorMessage);
                                Swal.showValidationMessage("Uh, oh. 發生了一點問題。");
                            })
                        }).catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            console.log(errorMessage);
                            Swal.showValidationMessage("密碼錯誤");
                        })
                    }
                });
            }else if(currentStep == 2){
                result = Swal.fire({
                    icon: "success",
                    title: "完成!",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    step_done[2] = true;
                    location.reload();
                });
            }
            if (step_done[currentStep] == true) {
                if(currentStep == 0){
                    values[currentStep] = result.value
                }
                console.log("trigger")
                currentStep++
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                step_done[currentStep] = false
                currentStep--
            } else {
                break;
            }
        }
    })

    drawCalendarNumber()
    drawCalendarTaskNumber();
    drawCalendarTitle();
}

function logout_func() {
    Swal.fire({
        icon: 'success',
        title: "已登出",
        showConfirmButton: false,
        timer: 1500
    }).then((result) => {
        window.location.href = "./logout";
    });
}

function upload_schedule() {

    var title = document.getElementById("schedule_data_title");
    var start_time = document.getElementById("schedule_data_start_time");
    var end_time = document.getElementById("schedule_data_end_time");
    var photo_url = document.getElementById("schedule_data_photo");
    var deadline_option = document.getElementById("schedule_data_open_deadline");
    var detail = document.getElementById("schedule_data_detail");

    var user_schedule = {};
    var user_name = document.getElementById("user_name").innerText;

    var data = db.collection("schedule").doc(user_email);

    if (title.value === "" || start_time.value === "" || end_time.value === "") {
        Swal.fire({
            icon: "error",
            title: "必須要設定標題、開始時間與結束時間",
            showConfirmButton: true
        });
        return;
    }

    data.get().then((doc) => {
        if (doc.exists) {
            user_schedule = doc.data();
        } else {
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    }).then(() => {

        console.log(user_schedule);


        var detail_string = detail.value.replace(/(?: |\r|\n|\r\n)/g, function (m) {
            return m === " " ? "<sp>" : "<br>";
        });

        data_package = {}
        data_package["title"] = title.value;
        data_package["start_time"] = start_time.value;
        data_package["end_time"] = end_time.value;
        data_package["photo_url"] = photo_url.value;
        data_package["deadline_option"] = deadline_option.value;
        data_package["detail"] = detail_string;

        random_hash = data_package["start_time"] + "_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        user_schedule[random_hash] = data_package;

        Swal.fire({
            title: "上傳中",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                db.collection("schedule").doc(user_email).set(user_schedule)
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: "上傳成功",
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            window.location.reload();
                        })
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                    });
            }
        });
    });
}

function drawCalendarTitle() {
    var date = new Date(current_calendar_year, current_calendar_month - 1, 1);
    document.getElementById("calendar_time").innerText = date.getFullYear().toString() + "年 " + (date.getMonth() + 1).toString() + "月";
}

function drawCalendarNumber() {
    var day = new Date(current_calendar_year, current_calendar_month - 1, 1);

    var weekOfDay = day.getUTCDay();
    var index = weekOfDay + 1;
    var countday = 1;
    var maxDay = new Date(current_calendar_year, current_calendar_month, 0).getDate();

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 7; j++) {
            var id = parseInt(i).toString() + "-" + parseInt(j).toString();
            var span_id = "calendar-date-" + parseInt(i).toString() + "-" + parseInt(j).toString();
            document.getElementById(id).setAttribute("class", "calendar_area_enable");
            document.getElementById(span_id).innerText = "";
        }
    }
    for (var i = index / 7; countday <= maxDay; i++) {
        for (var j = index % 7; countday <= maxDay; index++) {

            var id = parseInt(index / 7).toString() + "-" + parseInt(index % 7).toString();
            var td = document.getElementById(id);

            date_array[parseInt(index / 7)][parseInt(index % 7)] = countday;

            var date_span = document.getElementById("calendar-date-" + id);
            var count_span = document.getElementById("calendar-count-" + id);

            date_span.innerText = countday;

            countday += 1;
        }
    }
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 7; j++) {
            var span_id = "calendar-date-" + parseInt(i).toString() + "-" + parseInt(j).toString();
            if (document.getElementById(span_id).innerText === "") {
                var id = parseInt(i).toString() + "-" + parseInt(j).toString();
                var td = document.getElementById(id);
                td.setAttribute("class", "calendar_area_disable");
            }
        }
    }
}

function drawCalendarTaskNumber() {

    var value = db.collection("schedule").doc(user_email);
    var schedule = {};

    value.get().then((doc) => {
        if (!doc.exists) {
            return;
        }
        schedule = doc.data();
    }).then(() => {

        var keys = Object.keys(schedule);
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 7; j++) {
                var id = parseInt(i).toString() + "-" + parseInt(j).toString();
                var span_id = "calendar-count-" + id;
                document.getElementById(span_id).innerText = "";
            }
        }

        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 7; j++) {

                var id = parseInt(i).toString() + "-" + parseInt(j).toString();;
                var date_id = "calendar-date-" + parseInt(i).toString() + "-" + parseInt(j).toString();
                var count_id = "calendar-count-" + parseInt(i).toString() + "-" + parseInt(j).toString();

                if (document.getElementById(date_id).innerText === "") {
                    continue;
                }

                var day = parseInt(document.getElementById(date_id).innerText);

                var count = 0;
                var date = new Date(current_calendar_year, current_calendar_month - 1, day, 8, 0, 0);

                for (var k = 0; k < keys.length; k++) {
                    var data = schedule[keys[k]];
                    var start_time = new Date(data["start_time"]);
                    var end_time = new Date(data["end_time"]);
                    var current_unix = Math.floor(date / 1000);
                    var start_time_unix = Math.floor(start_time / 1000);
                    var end_time_unix = Math.floor(end_time / 1000);
                    if (current_unix >= start_time_unix && current_unix <= end_time_unix) {
                        count += 1;
                    }
                }

                document.getElementById(id).setAttribute("value", count);

                if (count != 0) {
                    var count_span = document.getElementById(count_id);
                    count_span.innerText = count.toString();
                }
            }
        }

    });
}

function updateSubDiv(id) {
    let day = date_array[parseInt(id.split("-")[0])][parseInt(id.split("-")[1])];

    let title_date = new Date(current_calendar_year, current_calendar_month - 1, day, 8, 0, 0, 0);

    /* Build submain div */
    let keys = Object.keys(schedule);

    document.getElementById("schedule-title").innerText = title_date.toISOString().split("T")[0] + " " + "行程資訊";

    let item_div = document.getElementById("schedule-info");

    while (item_div.lastElementChild) {
        item_div.removeChild(item_div.lastElementChild);
    }

    for (let i = 0; i < keys.length; i++) {
        let data = schedule[keys[i]];
        let start_time = new Date(data["start_time"]);
        let end_time = new Date(data["end_time"]);
        let start_time_unix = Math.floor(start_time / 1000);
        let end_time_unix = Math.floor(end_time / 1000);
        let current_time_unix = Math.floor(title_date / 1000);

        if (current_time_unix >= start_time_unix && current_time_unix <= end_time_unix) {
            /* data in time-range */

            var item = document.createElement("a");
            item.setAttribute("class", "list-group-item list-group-item-action task_content_div");
            item.setAttribute("value", keys[i]);
            item.style.setProperty("cursor", "pointer");
            item.style.setProperty("margin-top", "10px");

            var content_div = document.createElement("div");
            content_div.setAttribute("class", "d-flex w-100 justify-content-between");
            content_div.setAttribute("value", keys[i]);

            var title = document.createElement("h5");
            title.setAttribute("class", "mb-1");
            title.innerText = data["title"];
            title.setAttribute("value", keys[i]);

            var small = document.createElement("small");
            small.innerText = data["start_time"];
            small.setAttribute("value", keys[i]);

            var p = document.createElement("p");
            p.setAttribute("class", "mb-1");
            p.innerText = data["detail"].split("<br>")[0].replace("<sp>", " ") + (data["detail"].split("<br>").length > 2 ? "..." : "");
            p.setAttribute("value", keys[i]);

            var outer_small = document.createElement("small");
            outer_small.innerText = data["start_time"] + " - " + data["end_time"];
            outer_small.setAttribute("value", keys[i]);

            content_div.append(title);
            content_div.append(small);

            item.append(content_div);
            item.append(p);
            item.append(outer_small);

            item.addEventListener("click", function (event) {
                event.preventDefault();
                document.getElementById("schedule-detail").classList.remove("down-slidein");
                document.getElementById("schedule-detail").style.setProperty("visibility", "visible");
                place_detail(event.target.getAttribute("value"));
                void item.offsetWidth;
                document.getElementById("schedule-detail").classList.add("down-slidein");
            }, false)

            item_div.appendChild(item);
        }
    }
}

function autogrow(textarea) {

    var adjustedHeight = textarea.clientHeight;

    adjustedHeight = Math.max(textarea.scrollHeight, adjustedHeight);

    if (adjustedHeight > textarea.clientHeight) {
        textarea.style.height = adjustedHeight + 'px';
    }

}

function place_detail(code) {

    /* place data */
    var data = schedule[code];
    document.getElementById("detail_title").innerText = data["title"];
    document.getElementById("detail_time").innerText = data["start_time"] + "　　->　　" + data["end_time"];
    if (data["photo_url"].length != 0) {
        document.getElementById("detail_photo").style.setProperty("display", "block");
        document.getElementById("detail_photo").setAttribute("src", data["photo_url"]);
    } else {
        document.getElementById("detail_photo").style.setProperty("display", "none");
    }
    document.getElementById("detail_text").innerHTML = marked.parse(data["detail"].replaceAll("<br>", "\n").replaceAll("<sp>", " "));

    var button = document.getElementById("detail_button");
    button.setAttribute("value", code);
    button.innerText = "刪除這個事項";
}