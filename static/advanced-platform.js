async function plotUserDiagram(){
    /* Calculate user and root */
    const snapshot = await db.collection('user').get()
    let documents = snapshot.docs.map(doc => doc.data());
    let keys = Object.keys(documents);
    let roleType = {}
    
    for(var i = 0; i < keys.length; i++){
        var data = documents[keys[i]];
        if(roleType[data["role"]] === undefined){
            roleType[data["role"]] = 0;
        }
        roleType[data["role"]] += 1;
    }

    let values = []
    
    let typeKeys = Object.keys(roleType);

    for(var i = 0; i < typeKeys.length; i++){
        values[i] = roleType[typeKeys[i]]
    }
    
    /* Make pie plot */
    
    var data = [{
        y: values,
        x: typeKeys,
        text: values.map(String),
        textposition: 'auto',
        marker: {
            color: 'rgb(255,165,0)',
        },
        type: 'bar'
    }];
    
    var layout = {  
        title: '權限組別長條圖',
        font: {
            family: 'Arial',
            size: 18,
            color: 'black'
        },
    }

    var title = document.getElementsByTagName("h4")[0];
    title.innerText = "使用者數量：" + keys.length;

    Plotly.newPlot('user-plot', data, layout);
}

plotUserDiagram()

document.getElementById("delete_post").addEventListener("click", function(event){
    Swal.fire({
        title: "刪除文章",
        text: "請輸入文章的 ID",
        input: "text",
        preConfirm: async(ID) => {
            let docKeys = []
            const snapshot = await db.collection('schedule').get()

            await db.collection('schedule').get().then(querySnapshot => {
                querySnapshot.forEach(documentSnapshot => {
                    docKeys.push(documentSnapshot.id);
                })
            });
            
            let documents = snapshot.docs.map(doc => doc.data());
            let users = Object.keys(documents);
            let target_user = "";
            for(var i = 0; i < users.length; i++){
                var schedule_data = documents[users[i]];
                var schedule_keys = Object.keys(schedule_data);
                for(var j = 0; j < schedule_keys.length; j++){
                    if(schedule_keys[j] == ID){
                        target_user = docKeys[users[i]];
                    }
                }
            }
            await db.collection("schedule").doc(target_user).update({
                [ID]: firebase.firestore.FieldValue.delete()
            })
            Swal.fire({
                icon: "success",
                title: "已完成",
                timer: 1500,
                showConfirmButton: false
            });
        }

    })
})

document.getElementById("add_user").addEventListener("click", async function(event){
    const step = ['1', '2', '3'];
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
                title: "請輸入信箱",
                inputValue: values[0],
                currentProgressStep: currentStep,
                showCancelButton: currentStep > 0,
                preConfirm: async function(value) {
                    await db.collection("user").doc(value).get().then((doc) => {
                        if(doc.exists){
                            Swal.showValidationMessage("信箱已存在");
                        }else{
                            step_done[0] = true;
                        }
                    });
                }
            })
        }else if(currentStep == 1){
            result = await swalQueueStep.fire({
                title: "請輸入這隻帳號的使用者名稱",
                inputValue: values[1],
                currentProgressStep: currentStep,
                showCancelButton: currentStep > 0,
                preConfirm: async function(value) {
                    await db.collection("user").get().then((querySnapshot) => {
                        querySnapshot.forEach(documentSnapshot => {
                            if(documentSnapshot.get("username") == value){
                                Swal.showValidationMessage("用戶名稱已存在");
                            }
                        })
                    });
                    step_done[1] = true;
                }   
            });
        }else if(currentStep == 2){
            result = await swalQueueStep.fire({
                title: "請輸入這隻帳號的密碼",
                inputValue: values[2],
                currentProgressStep: currentStep,
                showCancelButton: currentStep > 0,
                preConfirm: async function(value) {
                    step_done[2] = true;
                    await app.auth().createUserWithEmailAndPassword(values[0], value).then(async(userCredential) => {
                        var user = userCredential.user;
                        await db.collection("user").doc(values[0]).set({
                            username: values[1],
                            role: "user"
                        })
                    }).catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log(errorMessage);
                    });
                    Swal.fire({
                        icon: 'success',
                        title: "已新增",
                        timer: 1500,
                        showConfirmButton: false
                    });
                }   
            });
        }
        if (step_done[currentStep] == true) {
            values[currentStep] = result.value
            currentStep++
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            step_done[currentStep] = false
            currentStep--
        } else {
            break;
        }
    }
})

document.getElementById("remove_user").addEventListener("click", async function(event){
    Swal.fire({
        title: "刪除帳號",
        text: "請輸入信箱",
        input: "text",
        preConfirm: async(email) => {
            await db.collection("schedule").doc(email).get().then((doc) => {
                if(!doc.exists){
                    Swal.showValidationMessage("信箱不存在");
                }
            })
            Swal.fire({
                icon: "warning",
                title: "確定要刪除這個帳號嗎？",
                text: email,
                preConfirm: async() => {
                    await db.collection("user").doc(email).get().then(async(doc) => {
                        if(doc.exists){
                            await db.collection("user").doc(email).delete();
                        }
                    });
                    await db.collection("schedule").doc(email).get().then(async(doc) => {
                        if(doc.exists){
                            await db.collection("schedule").doc(email).delete();
                        }
                    });
                    await $.ajax({
                        url: "./removeUser?user=" + email,
                        type: "POST",
                        contentType: "application/json;charset=utf-8",
                        success: function(){
                            Swal.fire({
                                icon: "success",
                                title: "已成功刪除！",
                                timer: 1500,
                                showConfirmButton: false
                            });
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(xhr.status);
                            console.log(thrownError);
                            return;
                        }
                    })
                }
            })
        }
    })
});

document.getElementById("list_user").addEventListener("click", async function(event){

    let docKeys = []
    const snapshot = await db.collection('user').get()

    await db.collection('user').get().then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
            docKeys.push(documentSnapshot.id);
        })
    });
    
    let documents = snapshot.docs.map(doc => doc.data());
    
    let table = document.createElement("table");

    let thead = document.createElement("thead");
    let th1 = document.createElement("th");
    th1.innerText = "權限組別"
    let th3 = document.createElement("th");
    th3.innerText = "使用者帳號"
    let th2 = document.createElement("th");
    th2.innerText = "使用者名稱"
    thead.append(th1);
    thead.append(th3);
    thead.append(th2);

    table.append(thead);

    table.setAttribute("class", "table");

    for(var i = 0; i < docKeys.length; i++){
        let tr = document.createElement("tr");
        
        let td1 = document.createElement("td");
        td1.innerText = docKeys[i];

        let td2 = document.createElement("td");
        td2.innerText = documents[i]["role"];

        let td3 = document.createElement("td");
        td3.innerText = documents[i]["username"];

        tr.append(td2);
        tr.append(td3);
        tr.append(td1);

        table.append(tr);
    }

    Swal.fire({
        title: "用戶列表",
        html: table
    });
});