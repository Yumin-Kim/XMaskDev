const webSocket = new NetworkTryObj("108.136.46.103", "5001");

// page Refresh
// $("#preloader").css("opacity", 0.6);
// $("#preloader").fadeIn(1000);

createWeb3(localIP)
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
      case "xm1010": {
        xm1010_mainPopupSignin();
        return;
      }
      case "xm1030": {
        xm1030_mainPopup(eth);
        return;
      }
      default:
        return;
    }
  })
  .catch(() => {});
function xm1010_mainPopupSignin() {
  chrome.storage.local.get("xm1010", result => {
    if (Object.entries(result.xm1010.data).length !== 0) {
      location.href = "xm1030.html";
    }
  });
  document.getElementById("xm1010btn").addEventListener("click", function (e) {
    loadingAnimation();
    document.getElementById("xm1010alert").textContent = "";
    e.preventDefault();
    const id = document.getElementById("id").value;
    const pin = document.getElementById("pin").value;
    if (id.trim() === "" || pin.trim() === "") {
      document.getElementById("xm1010alert").textContent =
        "아이디 비밀번호 입력 확인";
      return;
    } else {
      webSocket.webSocketInit(async socket => {
        const memberInfo = {};
        memberInfo.id = id;
        memberInfo.pin = pin;
        const response = await webSocket.sendMsgToSocket([
          "xm2110",
          JSON.stringify(memberInfo),
        ]);
        console.log(response);
        if (response.code === 9102) {
          chrome.storage.local.set({ xm1010: response });
          location.href = "xm1020.html";
        } else {
          loadingOutAnimation();
          document.getElementById("xm1010alert").textContent =
            "아이디 비밀번호 재입력";
          document.getElementById("id").value = "";
          document.getElementById("pin").value = "";
        }
      });
    }
  });
}
function xm1030_mainPopup(eth) {
  chrome.storage.local.get("xm1010", result => {
    console.log(result.xm1010);
    document.getElementById("address").textContent = result.xm1010.data.address;
    document.getElementById("id").textContent = result.xm1010.data.id;
    // getXRUNTokenBalanceOf({ address: result.xm1010.data.address, eth }).then(
    getXRUNTokenBalanceOf({
      address: "0x337f7e35f833a3be049bf2da6099cb33040dba68",
      eth,
    }).then(balance => {
      console.log(balance);
      if (balance.trim() !== "") {
        document.getElementById("xruntoken").textContent =
          Number(balance) / 100000000000000000 + " XRUN";
      } else {
        document.getElementById("xruntoken").textContent = "0 XRUN";
      }
    });
    topics = [
      null,
      // `0x000000000000000000000000${result.xm1010.data.address.slice(2)}`,
      `0x000000000000000000000000337f7e35f833a3be049bf2da6099cb33040dba68`,
    ];

    getContractPastEvents({ topics, eth }).then(async data => {
      const a = await data.reduce(async (prev, cur, index) => {
        const { returnValues, event } = cur;
        const prevData = await prev.then();
        const { timestamp } = await eth.getBlock(cur.blockNumber);

        return Promise.resolve([
          ...prevData,
          historyBlock({
            value: returnValues[2],
            to: returnValues[1],
            timestamp: unixToDate(timestamp),
            event,
          }),
        ]);
      }, Promise.resolve([]));
      const b = a.join(",").replaceAll(",", "");
      document.getElementById("historyList").innerHTML = b;
      if (data.length !== 0) {
        /////
      } else {
      }
    });
  });
  document.getElementById("xm1030flushCache").addEventListener("click", e => {
    chrome.storage.local.clear(() => {
      location.href = "xm1010.html";
    });
  });
}
function xm2110_signinFunction() {
  document.getElementById("xm2110btn").addEventListener("click", e => {
    loadingAnimation();
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
          loadingOutAnimation();
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

const historyBlock = ({ value, to, timestamp, event }) => `
<li class="historyliTag">
<div class="row">
  <div class="col-9">
    <div class="d-flex">
      <div class="flex-grow-1">
        <h3 class="mt-0 mb-1">${Number(value) / 100000000000000000} XRUN</h3>
        <h5 class="mt-0 eventHTag">${event}</h5>
        <p class="historyEle">to :${to}</p>
        <p class="historyEle">time :${timestamp}</p>
      </div>
    </div>
  </div>
  <div class="col-3">
    <div class="verify">
      <div class="verified">
        <span>
          <i class="la la-check"></i>
        </span>
      </div>
    </div>
  </div>
</div>
<hr/>
</li>`;
