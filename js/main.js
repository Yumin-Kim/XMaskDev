const webSocket = new NetworkTryObj("108.136.46.103", "5001");

// page Refresh
// $("#preloader").css("opacity", 0.6);
// $("#preloader").fadeIn(1000);

createWeb3(mainnetIP)
  .then(web3 => {
    const { eth } = web3;
    let { pathname } = location;
    console.log(pathname);
    [pathname] = pathname.slice(1).split(".");
    switch (pathname) {
      case "xm2110": {
        xm2110_signinFunction();
        return;
      }
      case "xm2210": {
        xm2210_signupFunction(eth);
        return;
      }
      case "xm2220": {
        xm2220_AuthEmailFunction();
        return;
      }
      case "xm2230": {
        xm2230_downloadKeyFile();
        return;
      }
      default:
        return;
    }
  })
  .catch(() => {});
function xm2110_signinFunction() {
  document.getElementById("xm2110btn").addEventListener("click", e => {
    document.getElementById("xm2110alert").textContent = "";
    e.preventDefault();
    const id = document.getElementById("id").value;
    const pin = document.getElementById("pin").value;
    if (id.trim() === "" || pin.trim() === "") {
      document.getElementById("xm2110alert").textContent =
        "아이디 비밀번호 입력 확인";
      return;
    } else {
      webSocket.webSocketInit(async socket => {
        loadingAnimation();
        const memberInfo = {};
        memberInfo.id = id;
        memberInfo.pin = pin;
        const data = await webSocket.sendMsgToSocket([
          "xm2110",
          JSON.stringify(memberInfo),
        ]);
        if (data.code === 9102) {
          chrome.storage.local.set({ xm2110: data });
          location.href = "xm2120.html";
        } else {
          document.getElementById("xm2110alert").textContent =
            "아이디 비밀번호 재입력";
          document.getElementById("id").value = "";
          document.getElementById("pin").value = "";
        }
      });
    }
  });
}

function xm2210_signupFunction() {
  document.getElementById("xm2210btn").addEventListener("click", function (e) {
    e.preventDefault();
    const id = document.getElementById("id").value;
    const pin = document.getElementById("pin").value;
    const email = document.getElementById("email").value;
    const phonenumber = document.getElementById("phoneNumber").value;
    if (
      id.trim() === "" ||
      pin.trim() === "" ||
      phonenumber.trim() === "" ||
      email.trim() === ""
    ) {
      alert("아이디 비밀번호 입력 필요");
      return;
    } else {
      webSocket.webSocketInit(async socket => {
        loadingAnimation();
        const memberInfo = {};
        memberInfo.id = id;
        memberInfo.pin = pin;
        memberInfo.email = email;
        memberInfo.phonenumber = phonenumber;
        const data = await webSocket.sendMsgToSocket([
          "xm2210",
          JSON.stringify(memberInfo),
        ]);
        if (data.code === 9102) {
          chrome.storage.local.set({ xm2210: data });
          location.href = "xm2220.html";
        }
      });
    }
  });
}
function xm2220_AuthEmailFunction() {
  let count = 0;
  chrome.storage.local.get("xm2210", result => {
    if (Object.entries(result).length !== 0) {
      const { data } = result.xm2210;
      document.getElementById("memberemail").textContent = data.email;
      // document.getElementById("auth").

      document.getElementById("sendEmail").addEventListener("click", e => {
        e.preventDefault();
        webSocket.webSocketInit(async socket => {
          const response = await webSocket.sendMsgToSocket([
            "xm2221_request",
            JSON.stringify(data),
          ]);
          if (response.code === 9102) {
            chrome.storage.local.set({ xm2221_request: response });
            console.log(response);
            document.getElementById("sendEmail").hidden = true;
            document.getElementById("auth").hidden = false;
            document.getElementById("pass").hidden = false;
          }
        });
        document.getElementById("auth").addEventListener("click", e => {
          e.preventDefault();
          webSocket.webSocketInit(async socket => {
            const response = await webSocket.sendMsgToSocket([
              "xm2222_auth",
              JSON.stringify(data),
            ]);
            if (response.code === 9102) {
              chrome.storage.local.set({ xm2222_auth: response });
              console.log(response);
              document.getElementById("auth").hidden = true;
            }
          });
        });
        document.getElementById("pass").addEventListener("click", e => {});
        // if (count === 1) {
        //   //소켓 초기화
        //   webSocket.webSocketInit(async socket => {
        //     const response = await webSocket.sendMsgToSocket([
        //       "xm2121_request",
        //       JSON.stringify(data),
        //     ]);
        //     if (response.code === 9102) {
        //       chrome.storage.local.set({ xm2210: response });
        //       location.href = "xm2220.html";
        //     }
        //   });
        // } else if (count === 0) {
        // } else {
        // }
        // count++;
      });
    }
  });
}
function xm2230_downloadKeyFile() {
  document.getElementById("xm2230btn").addEventListener("click", () => {
    loadingAnimation();
    chrome.storage.local.get("xm2210", cacheData => {
      console.log(cacheData.xm2210);
      webSocket.webSocketInit(async socket => {
        const respose = await webSocket.sendMsgToSocket([
          "xm2230",
          JSON.stringify(cacheData.xm2210.data),
        ]);
        console.log(respose);
        if (respose.code === 9102) {
          const { data } = respose;
          saveToFile_Chrome(
            data.filename.split("/")[data.filename.split("/").length - 1],
            data.filedata
          );
          loadingOutAnimation();
          location.href = "about.html";
        } else {
          document.getElementById("xm2110alert").textContent = "서버 오류";
        }
      });
    });
  });
}
function saveToFile_Chrome(fileName, content) {
  var blob = new Blob([content], { type: "text/plain" });
  objURL = window.URL.createObjectURL(blob);

  // 이전에 생성된 메모리 해제
  if (window.__Xr_objURL_forCreatingFile__) {
    window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
  }
  window.__Xr_objURL_forCreatingFile__ = objURL;
  var a = document.createElement("a");
  a.download = fileName;
  a.href = objURL;
  a.click();
}
function loadingAnimation() {
  $("#preloader").css("opacity", 0.6);
  $("#preloader").fadeIn(1000);
}
function loadingOutAnimation() {
  $("#preloader").fadeOut(500);
}
