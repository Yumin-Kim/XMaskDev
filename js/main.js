const webSocket = new NetworkTryObj("108.136.46.103", "5001");
let mainnetAccountList;
// page Refresh
// $("#preloader").css("opacity", 0.6);
// $("#preloader").fadeIn(1000);
let utils;
createWeb3(mainnetIP)
  .then(web3 => {
    const { eth } = web3;
    utils = web3.utils;
    getMainnetAccountList({ eth }).then(accounts => {
      let mainnetAccount = accounts.map(v => v.toLowerCase());
      chrome.storage.local.set({ mainnetAccount });
    });
    let { pathname } = location;
    console.log(pathname);
    [pathname] = pathname.slice(1).split(".");
    switch (pathname) {
      case "xm2110": {
        xm2110_signinFunction();
        return;
      }
      case "xm2120": {
        xm2120_requestEmail();
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
      case "xm3010": {
        xm3010_inputAddress(eth);
        return;
      }
      case "xm3030": {
        xm3030_inputBalance(eth);
        return;
      }
      case "xm3050": {
        xm3050_inputpassword(eth, utils);
        return;
      }
      case "xm3060": {
        xm3060_receipt(eth);
        return;
      }
      case "xm3070": {
        xm3070_failureReceipt();
        return;
      }
      default:
        return;
    }
  })
  .catch(() => {});
function xm1010_mainPopupSignin() {
  chrome.storage.local.get("xm1010", result => {
    if (result.xm1010 !== undefined) {
      if (Object.entries(result.xm1010.data).length !== 0) {
        location.href = "xm1030.html";
      }
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
          // location.href = "xm1020.html";
          location.href = "xm1030.html";
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
  chrome.storage.local.get("xm1010", localStorageData => {
    chrome.storage.local.set({ xmTransferAddress: "" });
    chrome.storage.local.set({
      xmTransferValue: {},
    });
    userBaseWalletInfo({
      address: localStorageData.xm1010.data.address,
      id: localStorageData.xm1010.data.id,
      email: localStorageData.xm1010.data.email,
      eth,
    });
    let topics = [
      null,
      `0x000000000000000000000000${localStorageData.xm1010.data.address.slice(
        2
      )}`,
    ];
    getContractPastEvents({ topics, eth })
      .then(fromGetPastEventResult => {
        const topics = [
          null,
          null,
          `0x000000000000000000000000${localStorageData.xm1010.data.address.slice(
            2
          )}`,
        ];
        getContractPastEvents({ topics, eth }).then(
          async toGetPastEventResult => {
            let memberPastEventResultArray = [];
            if (fromGetPastEventResult.length !== 0) {
              memberPastEventResultArray = [...fromGetPastEventResult];
            }
            let historyInnerHTML;
            if (toGetPastEventResult.length !== 0) {
              memberPastEventResultArray = [
                ...memberPastEventResultArray,
                ...toGetPastEventResult,
              ];
              memberPastEventResultArray.sort(function (a, b) {
                if (a.blockNumber > b.blockNumber) {
                  return 1;
                }
                if (a.blockNumber < b.blockNumber) {
                  return -1;
                }
                return 0;
              });
              const contractList = memberPastEventResultArray.reverse();
              const historyArray = await contractList.reduce(
                async (prev, cur, index) => {
                  const { returnValues, event } = cur;
                  const prevData = await prev.then();
                  const { timestamp } = await eth.getBlock(cur.blockNumber);
                  return Promise.resolve([
                    ...prevData,
                    historyBlock({
                      value: exponentionToValue(returnValues[2]),
                      from: returnValues[0],
                      to: returnValues[1],
                      timestamp: unixToDate(timestamp),
                      event,
                      fromMember:
                        localStorageData.xm1010.data.address.toLocaleLowerCase() ===
                        returnValues[0].toLocaleLowerCase()
                          ? true
                          : false,
                      toMember:
                        localStorageData.xm1010.data.address.toLocaleLowerCase() ===
                        returnValues[1].toLocaleLowerCase()
                          ? true
                          : false,
                    }),
                  ]);
                },
                Promise.resolve([])
              );
              historyInnerHTML = historyArray.join(",").replaceAll(",", "");
            } else {
              historyInnerHTML = `<li class="historyliTag">
                        <div class="row">
                          <div class="col-9">
                            <div class="d-flex">
                              <div class="flex-grow-1">
                                <h4 class="mt-0 mb-1">No Data...</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr />
                      </li>`;
            }
            document.getElementById("historyList").innerHTML = historyInnerHTML;
          }
        );
      })
      .finally(() => {});
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
          // location.href = "xm2120.html";
          location.href = "xm1100.html";
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
function xm2120_requestEmail() {
  chrome.storage.local.get("xm2110", ({ xm2110 }) => {
    console.log(xm2110);
    webSocket.webSocketInit(async socket => {
      const memberInfo = {};
      memberInfo.id = xm2110.id;
      memberInfo.pin = xm2110.pin;
      memberInfo.email = xm2110.email;
      memberInfo.member = xm2110.member;
      const data = await webSocket.sendMsgToSocket([
        "xm2221_request",
        JSON.stringify(memberInfo),
      ]);
      if (data.code === 9102) {
        chrome.storage.local.set({ xm2210: data });
        // 0412 verifiy email
        // location.href = "xm2220.html";
        location.href = "xm1100.html";
      }
    });
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
          location.href = "xm2230.html";
          // location.href = "xm2230.html";
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
            data.filename
              .split("/")
              [data.filename.split("/").length - 1].substring(
                0,
                data.filename.length - 2
              ),
            data.filedata
          );
          loadingOutAnimation();
          location.href = "xm1100.html";
          // location.href = "xm1100.html";
        } else {
          document.getElementById("xm2110alert").textContent = "서버 오류";
        }
      });
    });
  });
}
function xm3010_inputAddress(eth) {
  chrome.storage.local.get("xm1010", localStorageData => {
    userBaseWalletInfo({
      address: localStorageData.xm1010.data.address,
      id: localStorageData.xm1010.data.id,
      email: localStorageData.xm1010.data.email,
      eth,
    });
  });
  document.getElementById("xm3010btn").addEventListener("click", () => {
    chrome.storage.local.get("mainnetAccount", ({ mainnetAccount }) => {
      const sendToAddress = document
        .getElementById("sendAddress")
        .value.toLowerCase();
      console.log(mainnetAccount.length);
      if (mainnetAccount.includes(sendToAddress)) {
        chrome.storage.local.set({ xmTransferAddress: sendToAddress });
        location.href = "xm3030.html";
      } else {
        document.getElementById("xm3010alert").textContent =
          "Not found to address in XRUN Mainnet ";
      }
    });
  });
  document.getElementById("xm1030flushCache").addEventListener("click", e => {
    chrome.storage.local.clear(() => {
      location.href = "xm1010.html";
    });
  });
}
function xm3030_inputBalance(eth) {
  chrome.storage.local.get("xm1010", localStorageData => {
    userBaseWalletInfo({
      address: localStorageData.xm1010.data.address,
      id: localStorageData.xm1010.data.id,
      email: localStorageData.xm1010.data.email,
      eth,
    });
  });
  document.getElementById("xm3030btn").addEventListener("click", () => {
    const value = document.getElementById("sendBalance").value;
    const memberBalanceOf = document.getElementById("xruntoken").innerText;
    document.getElementById("xm3030alert").textContent = "";
    if (isNaN(Number(value))) {
      document.getElementById("xm3030alert").textContent =
        "숫자를 입력해주세요";
      document.getElementById("sendBalance").value = "";
    } else {
      if (Number(memberBalanceOf.replace(" XRUN", "")) - Number(value) >= 0) {
        console.log(value);
        console.log(memberBalanceOf);
        console.log(value);
        chrome.storage.local.set({
          xmTransferValue: {
            value,
            remainValue:
              Number(memberBalanceOf.replace(" XRUN", "")) - Number(value),
          },
        });
        location.href = "xm3050.html";
      } else {
        document.getElementById("sendBalance").value = "";
        document.getElementById("xm3030alert").textContent = "잔액 부족";
      }
    }
  });
  document.getElementById("xmTransfer").addEventListener("click", () => {
    chrome.storage.local.set({ xmTransferAddress: "" });
    location.href = "xm3010.html";
  });
  document.getElementById("xm1030flushCache").addEventListener("click", e => {
    chrome.storage.local.clear(() => {
      location.href = "xm1010.html";
    });
  });
}
function xm3050_inputpassword(eth, utils) {
  chrome.storage.local.get("xm1010", ({ xm1010 }) => {
    chrome.storage.local.get("xmTransferAddress", ({ xmTransferAddress }) => {
      chrome.storage.local.get("xmTransferValue", ({ xmTransferValue }) => {
        document.getElementById("toAddress").textContent = xmTransferAddress;
        document.getElementById(
          "remainValue"
        ).textContent = `${xmTransferValue.remainValue} XRUN`;
        document.getElementById(
          "value"
        ).textContent = `${xmTransferValue.value} XRUN`;
        document.getElementById("xm3050btn").addEventListener("click", e => {
          const pin = document.getElementById("pin").value;
          document.getElementById("xm3050alert").textContent = "";
          if (pin.trim() != "") {
            loadingAnimation();
            webSocket.webSocketInit(async socket => {
              const memberInfo = {};
              memberInfo.member = xm1010.data.member;
              memberInfo.pin = pin;
              const response = await webSocket.sendMsgToSocket([
                "xm3050",
                JSON.stringify(memberInfo),
              ]);
              console.log(response);
              if (response.code === 9102) {
                walletContractTokenTransfer({
                  utils,
                  eth,
                  toAddress: xmTransferAddress,
                  pin,
                  fromAddress: xm1010.data.address,
                  value: xmTransferValue.value,
                })
                  .then(response => {
                    console.log(response);
                    loadingOutAnimation();
                    chrome.storage.local.set({ receipt: response });
                    location.href = "xm3060.html";
                  })
                  .catch(error => {
                    location.href = "xm3070.html";
                    chrome.storage.local.set({ receiptError: error });
                    console.log(error);
                  });
              } else {
                loadingOutAnimation();
                document.getElementById("xm3050alert").textContent =
                  "비밀번호 불일치";
                document.getElementById("pin").value = "";
              }
            });
          } else {
            document.getElementById("xm3050alert").textContent =
              "비밀번호 입력";
            document.getElementById("pin").value = "";
          }
        });
      });
    });
  });
  document.getElementById("xm1030flushCache").addEventListener("click", e => {
    chrome.storage.local.clear(() => {
      location.href = "xm1010.html";
    });
  });
}
function xm3060_receipt(eth) {
  document.getElementById("home").addEventListener("click", () => {
    location.href = "xm1030.html";
  });
  chrome.storage.local.get("receipt", ({ receipt }) => {
    chrome.storage.local.get("xmTransferValue", async ({ xmTransferValue }) => {
      console.log(receipt);
      // if (receipt.code === 9101) {
      //   location.href = "xm3070.html";
      // }
      const { timestamp } = await eth.getBlock(receipt.response.blockNumber);
      const { 1: toAddress, 2: balance } =
        receipt.response.events.Transfer.returnValues;
      document.getElementById("value").textContent =
        exponentionToValue(balance) + " XRUN";
      document.getElementById("toAddress").textContent = toAddress;
      document.getElementById("remainValue").textContent =
        xmTransferValue.remainValue + " XRUN";
      document.getElementById("timestamp").textContent = unixToDate(timestamp);
      document.getElementById("blockNumber").textContent =
        receipt.response.blockNumber;
    });
  });
}
function xm3070_failureReceipt() {
  document.getElementById("home").addEventListener("click", () => {
    location.href = "xm1030.html";
  });
}
function saveToFile_Chrome(fileName, content) {
  console.log(fileName);
  var blob = new Blob([content], { type: "text/plain" });
  objURL = window.URL.createObjectURL(blob);

  // 이전에 생성된 메모리 해제
  if (window.__Xr_objURL_forCreatingFile__) {
    window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
  }
  window.__Xr_objURL_forCreatingFile__ = objURL;
  var a = document.createElement("a");
  console.log(fileName);
  console.log(objURL);
  a.download = fileName.slice(0, fileName.length - 2);
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

const historyBlock = ({
  value,
  to,
  from,
  timestamp,
  event,
  fromMember,
  toMember,
}) => `
<li class="historyliTag">
<div class="row">
  <div class="col-9">
    <div class="d-flex">
      <div class="flex-grow-1">
        <h3 class="mt-0 mb-1">${value} XRUN</h3>
        <h5 class="mt-0 eventHTag">${event}</h5>
        <p class="historyEle ${fromMember ? "bold" : null}">from :${from}</p>
        <p class="historyEle ${toMember ? "bold" : null}">to :${to}</p>
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

// fromWei 추가
// 지수표기 변경 소수점
function exponentionToValue(value) {
  memberBalance = utils.fromWei(utils.toBN(value), "ether");
  return memberBalance;
}

function userBaseWalletInfo({ address, email, id, eth }) {
  document.getElementById("address").textContent = address;
  document.getElementById("id").textContent = id;
  document.getElementById("email").textContent = email;
  getXRUNTokenBalanceOf({ address: address, eth }).then(balance => {
    console.log(balance);
    if (balance.trim() !== "") {
      document.getElementById("xruntoken").textContent =
        exponentionToValue(Number(balance)) + " XRUN";
    } else {
      document.getElementById("xruntoken").textContent = "0 XRUN";
    }
  });
}
