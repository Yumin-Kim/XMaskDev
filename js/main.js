const webSocket = new NetworkTryObj("108.136.46.103", "5002");
let mainnetAccountList;
const regionSelectData = [
  {
    region: "US",
    code: 1,
  },
  {
    region: "KR",
    code: 82,
  },
  {
    region: "ID",
    code: 62,
  },
  {
    region: "EU",
    code: 32,
  },
  {
    region: "GB",
    code: 44,
  },
  {
    region: "JP",
    code: 81,
  },
  {
    region: "SG",
    code: 65,
  },
];
const msg = {
  xm1100: {
    inputBox:
      "Please input your XRUN AR Appliaction email , password information",
  },
  xm1110: {
    ErrorSendSMSData: "ReTry send mobile code or re-enter mobile code",
    ResendSMSData: "Re-Send mobile code , please check your phone",
  },
  xm2110: {
    NotInputData: "Input information",
    sendSMSData: "Please check. Your mobile authentication code has been sent",
    ErrorSendSMSData: "Please re-enter your cell phone information",
  },
  xm2120: {
    inputBox:
      "Please input your XRUN AR Appliaction email , password information",
  },
  xm2210: {
    NotInputData: "Input information",
    sendSMSData: "Please check. Your mobile authentication code has been sent",
    ErrorSendSMSData: "Please re-enter your cell phone information",
  },
  xm3010: {
    validAddress: "Invalid Address",
  },
  xm3030: {
    balanceInputBox: "Please only number",
    balanceInputBoxError: "A shortage of balance",
  },
  xm3050: {
    pinErorr: "Not Match Your input Password",
    pinEmpty: "Please your password",
  },
};

const gatewayRemoteAddresss = "https://app.xrun.run/gateway.php";

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
      case "xm1000": {
        xm1000_mainPopup(eth);
        return;
      }
      case "xm1100": {
        xm1100_mainPopupSignin();
        return;
      }
      case "xm1110": {
        xm1110_requestSMS();
        return;
      }
      case "xm2120": {
        xm2120_signinFunction();
        return;
      }
      case "xm2110": {
        // xm2110_requestEmail();
        xm2110_requestSMS();
      }
      case "xm2220": {
        xm2220_signupFunction(eth);
        return;
      }
      case "xm2210": {
        // xm2210_AuthEmailFunction();
        xm2210_requestSMS();
        return;
      }
      case "xm2230": {
        xm2230_downloadKeyFile();
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
      case "xm5101": {
        xm5101_detailERC20TransacitonRecipt(eth);
        return;
      }
      default:
        return;
    }
  })
  .catch(() => {});
function xm1000_mainPopup(eth) {
  chrome.storage.local.get("xm1100", localStorageData => {
    console.log(localStorageData);
    chrome.storage.local.set({ xmTransferAddress: "" });
    chrome.storage.local.set({
      xmTransferValue: {},
    });
    // copy address
    document.getElementById("address").addEventListener("click", () => {
      var tempElem = document.createElement("textarea");
      tempElem.value = localStorageData.xm1100.data.address;
      document.body.appendChild(tempElem);
      tempElem.select();
      document.execCommand("copy");
      document.body.removeChild(tempElem);
      alert(`Success copy address "${localStorageData.xm1100.data.address}"`);
    });
    // key file download
    document.getElementById("xm4200").addEventListener("click", () => {
      chrome.storage.local.get("xm2220", cacheData => {
        webSocket.webSocketInit(async socket => {
          const respose = await webSocket.sendMsgToSocket([
            "xm2230",
            JSON.stringify(localStorageData.xm1100.data),
          ]);
          if (respose.code === 9102) {
            const { data } = respose;
            const filename = `${localStorageData.xm1100.data.email}_${localStorageData.xm1100.data.address}.xrunkey`;
            saveToFile_Chrome(filename, data.filedata);
            // loadingOutAnimation();
          } else {
            alert(respose.message);
            // document.getElementById("xm2120alert").textContent = "서버 오류";
          }
        });
      });
    });

    userBaseWalletInfo({
      address: localStorageData.xm1100.data.address,
      // id: localStorageData.xm1100.data.id,
      email: localStorageData.xm1100.data.email,
      eth,
    });
    let topics = [
      null,
      `0x000000000000000000000000${localStorageData.xm1100.data.address.slice(
        2
      )}`,
    ];
    let validTransferReceipt = false;
    getContractPastEvents({ topics, eth })
      .then(fromGetPastEventResult => {
        const topics = [
          null,
          null,
          `0x000000000000000000000000${localStorageData.xm1100.data.address.slice(
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
                  const { returnValues, event, transactionHash } = cur;
                  const prevData = await prev.then();
                  const { timestamp } = await eth.getBlock(cur.blockNumber);
                  return Promise.resolve([
                    ...prevData,
                    historyBlock({
                      txHash: transactionHash,
                      value: exponentionToValue(returnValues[2]),
                      from: returnValues[0],
                      to: returnValues[1],
                      timestamp: unixToDate(timestamp),
                      event,
                      fromMember:
                        localStorageData.xm1100.data.address.toLocaleLowerCase() ===
                        returnValues[0].toLocaleLowerCase()
                          ? true
                          : false,
                      toMember:
                        localStorageData.xm1100.data.address.toLocaleLowerCase() ===
                        returnValues[1].toLocaleLowerCase()
                          ? true
                          : false,
                    }),
                  ]);
                },
                Promise.resolve([])
              );
              historyInnerHTML = historyArray.join(",").replaceAll(",", "");
              validTransferReceipt = true;
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
            if (validTransferReceipt) {
              const historyLiTags =
                document.getElementsByClassName("historyliTag");
              Array(document.getElementsByClassName("historyliTag").length)
                .fill()
                .forEach((v, i) => {
                  const historyLiTag = historyLiTags.item(i);
                  historyLiTag.addEventListener("click", () => {
                    const txhash = historyLiTag
                      .getElementsByTagName("input")
                      .item(0).value;
                    const value = historyLiTag
                      .getElementsByTagName("input")
                      .item(1).value;
                    location.href = `xm5101.html?txHash=${txhash}&value=${value}`;
                  });
                });
            }
          }
        );
      })
      .finally(() => {});
  });
  document.getElementById("xm1000flushCache").addEventListener("click", e => {
    chrome.storage.local.clear(() => {
      location.href = "xm1100.html";
    });
  });
}
function xm1100_mainPopupSignin() {
  chrome.storage.local.get(result => {
    const { search } = location;
    const [, clear] = search.split("=");
    console.log(result);
    if (clear === "true") {
      chrome.storage.local.set({ xm1100: {} });
      chrome.storage.local.set({ xm1110: "" });
      return;
    }
    if (result.xm1110 !== undefined) {
      if (result.xm1110 === "auth") location.href = "xm1000.html";
    }
  });
  document.getElementById("xm1100btn").addEventListener("click", function (e) {
    loadingAnimation();
    document.getElementById("xm1100alert").textContent = "";
    e.preventDefault();
    const email = document.getElementById("email").value;
    const pin = document.getElementById("pin").value;
    if (email.trim() === "" || pin.trim() === "") {
      document.getElementById("xm1100alert").textContent = msg.xm1100.inputBox;
      return;
    } else {
      webSocket.webSocketInit(async socket => {
        const memberInfo = {};
        memberInfo.email = email;
        memberInfo.pin = pin;
        const response = await webSocket.sendMsgToSocket([
          "xm1100",
          JSON.stringify(memberInfo),
        ]);
        console.log(response);
        if (response.code === 9102) {
          chrome.storage.local.set({ xm1100: response });
          location.href = "xm1110.html";
          // location.href = "xm1000.html";
        } else {
          loadingOutAnimation();
          document.getElementById("xm1100alert").textContent =
            msg.xm1100.inputBox;
          document.getElementById("email").value = "";
          document.getElementById("pin").value = "";
        }
      });
    }
  });
}
function xm1110_requestSMS() {
  chrome.storage.local.get("xm1100", ({ xm1100 }) => {
    displayTag(document.getElementsByClassName("xm1110ReSendbtn"), "none");
    AJAXRequestMethod({
      method: "POST",
      requestURL: `${gatewayRemoteAddresss}?act=login-02&mobile=${xm1100.data.mobile}&country=${xm1100.data.mobilecode}`,
    }).then(data => {
      document.getElementById(`xm1110Verify`).addEventListener("click", e => {
        e.preventDefault();
        const code = document.getElementById("mobilecode").value;
        AJAXRequestMethod({
          method: "POST",
          requestURL: `${gatewayRemoteAddresss}?act=login-03&mobile=${xm1100.data.mobile}&code=${code}`,
        }).then(verify => {
          const { data } = verify;
          console.log("Verify");
          if (data === "login") {
            chrome.storage.local.set({ xm1110: "auth" });
            location.href = `xm1000.html`;
          } else {
            document
              .getElementById("xm1110alert")
              .classList.remove("text-success");
            document.getElementById("xm1110alert").classList.add("text-danger");
            document.getElementById("xm1110alert").innerHTML =
              msg.xm1110.ErrorSendSMSData;
            displayTag(
              document.getElementsByClassName(`xm1110ReSendbtn`),
              "block"
            );
            document.getElementById("mobilecode").value = "";
          }
        });
      });
    });
    document.getElementById("xm1110ReSend").addEventListener("click", e => {
      e.preventDefault();
      document.getElementById("xm1110alert").classList.add("text-success");
      document.getElementById("xm1110alert").classList.remove("text-danger");
      document.getElementById("xm1110alert").innerHTML =
        msg.xm1110.ResendSMSData;
      AJAXRequestMethod({
        method: "POST",
        requestURL: `${gatewayRemoteAddresss}?act=login-02&mobile=${xm1100.data.mobile}&country=${xm1100.data.mobilecode}`,
      }).then(data => {
        document.getElementById(`xm1110Verify`).addEventListener("click", e => {
          e.preventDefault();
          const code = document.getElementById("mobilecode").value;
          AJAXRequestMethod({
            method: "POST",
            requestURL: `${gatewayRemoteAddresss}?act=login-03&mobile=${xm1100.data.mobile}&code=${code}`,
          }).then(verify => {
            const { data } = verify;
            if (data === "login") {
              chrome.storage.local.set({ xm1110: "auth" });
              location.href = `xm1000.html`;
            } else {
              displayTag(
                document.getElementsByClassName(`xm1110ReSendbtn`),
                "block"
              );
              document
                .getElementById("xm1110alert")
                .classList.remove("text-success");
              document
                .getElementById("xm1110alert")
                .classList.add("text-danger");
              document.getElementById("xm1110alert").innerHTML =
                msg.xm1110.ErrorSendSMSData;
              document.getElementById("mobilecode").value = "";
            }
          });
        });
      });
    });
  });
}
function xm2110_requestEmail() {
  chrome.storage.local.get("xm2120", ({ xm2120 }) => {
    console.log(xm2120);
    webSocket.webSocketInit(async socket => {
      const memberInfo = {};
      memberInfo.id = xm2120.id;
      memberInfo.pin = xm2120.pin;
      memberInfo.email = xm2120.email;
      memberInfo.member = xm2120.member;
      const data = await webSocket.sendMsgToSocket([
        "xm2221_request",
        JSON.stringify(memberInfo),
      ]);
      if (data.code === 9102) {
        chrome.storage.local.set({ xm2220: data });
        // 0412 verifiy email
        // location.href = "xm2210.html";
        location.href = "xm2130.html";
      }
    });
  });
}
function xm2110_requestSMS() {
  displayTag(document.getElementsByClassName("xm2110ReSendbtn"), "none");
  displayTag(document.getElementsByClassName("inputMobileCodeClass"), "none");
  displayTag(document.getElementsByClassName("xm2110SendFinallbtn"), "none");

  document
    .getElementsByClassName("xm2110sendbtn")
    .item(0)
    .addEventListener("click", e => {
      e.preventDefault();
      validAndRequestMobileCode("xm2110", "xm2120");
    });

  document.getElementById("xm2110ReSend").addEventListener("click", e => {
    e.preventDefault();
    validAndRequestMobileCode("xm2110", "xm2120");
  });
}
function xm2120_signinFunction() {
  document.getElementById("xm2120btn").addEventListener("click", e => {
    loadingAnimation();
    document.getElementById("xm2120alert").textContent = "";
    e.preventDefault();
    const email = document.getElementById("email").value;
    const pin = document.getElementById("pin").value;
    if (email.trim() === "" || pin.trim() === "") {
      document.getElementById("xm2120alert").textContent = msg.xm2120.inputBox;
      return;
    } else {
      webSocket.webSocketInit(async socket => {
        const memberInfo = {};
        memberInfo.email = email;
        memberInfo.pin = pin;
        const data = await webSocket.sendMsgToSocket([
          "xm2120",
          JSON.stringify(memberInfo),
        ]);
        if (data.code === 9102) {
          chrome.storage.local.set({ xm2120: data });
          location.href = "xm2130.html";
        } else {
          loadingOutAnimation();
          document.getElementById("xm2120alert").textContent =
            msg.xm2120.inputBox;
          document.getElementById("email").value = "";
          document.getElementById("pin").value = "";
        }
      });
    }
  });
}

function xm2210_requestSMS() {
  displayTag(document.getElementsByClassName("xm2210ReSendbtn"), "none");
  displayTag(document.getElementsByClassName("inputMobileCodeClass"), "none");
  displayTag(document.getElementsByClassName("xm2210SendFinallbtn"), "none");

  document
    .getElementsByClassName("xm2210sendbtn")
    .item(0)
    .addEventListener("click", e => {
      e.preventDefault();
      validAndRequestMobileCode("xm2210", "xm2220", phoneNumber => {
        chrome.storage.local.set({ xm2210: phoneNumber });
      });
    });

  document.getElementById("xm2210ReSend").addEventListener("click", e => {
    e.preventDefault();
    validAndRequestMobileCode("xm2210", "xm2220", data => {
      chrome.storage.local.set({ xm2210: data });
    });
  });
}
function xm2210_AuthEmailFunction() {
  let count = 0;
  chrome.storage.local.get("xm2220", result => {
    if (Object.entries(result).length !== 0) {
      const { data } = result.xm2220;
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
function xm2220_signupFunction() {
  chrome.storage.local.get("xm2210", ({ xm2210 }) => {
    document.getElementById("phoneNumber").value = xm2210.mobile;
    document.getElementById("region").value = xm2210.country;
  });
  document.getElementById("xm2220btn").addEventListener("click", function (e) {
    e.preventDefault();
    // const id = document.getElementById("id").value;
    let phonenumber = document.getElementById("phoneNumber").value;
    const pin = document.getElementById("pin").value;
    const email = document.getElementById("email").value;
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const region = document.getElementById("region").value;
    if (phonenumber.length === 11) {
      phonenumber = String(phonenumber)
        .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
        .replace(/\-{1,2}$/g, "");
    }
    if (
      pin.trim() === "" ||
      phonenumber.trim() === "" ||
      email.trim() === "" ||
      firstname.trim() === "" ||
      lastname.trim() === "" ||
      region.trim() === ""
    ) {
      alert("You need to enter information for membership");
      return;
    } else {
      webSocket.webSocketInit(async socket => {
        loadingAnimation();
        const memberInfo = {};
        regionSelectData.forEach(value => {
          if (value.region === region) {
            memberInfo.mobilecode = value.code;
          }
        });
        memberInfo.pin = pin;
        memberInfo.email = email;
        memberInfo.phonenumber = phonenumber;
        memberInfo.firstname = firstname;
        memberInfo.lastname = lastname;
        memberInfo.region = region;
        const data = await webSocket.sendMsgToSocket([
          "xm2220",
          JSON.stringify(memberInfo),
        ]);
        if (data.code === 9102) {
          chrome.storage.local.set({ xm2220: data });
          location.href = "xm2230.html";
        } else if (data.code === 9101) {
          alert(data.message);
          loadingOutAnimation();
          document.getElementById("pin").value = "";
          document.getElementById("email").value = "";
        }
      });
    }
  });
}
function xm2230_downloadKeyFile() {
  document.getElementById("xm2230btn").addEventListener("click", () => {
    loadingAnimation();
    chrome.storage.local.get("xm2220", cacheData => {
      console.log("xm2220_get Chrome Store");
      console.log(cacheData.xm2220);
      webSocket.webSocketInit(async socket => {
        const respose = await webSocket.sendMsgToSocket([
          "xm2230",
          JSON.stringify(cacheData.xm2220.data),
        ]);
        console.log(respose);
        if (respose.code === 9102) {
          const { data } = respose;
          // const filename = data.filename
          //   .split("/")
          //   [data.filename.split("/").length - 1].substring(
          //     0,
          //     data.filename.length - 2
          //   )
          const filename = `${cacheData.xm2220.data.email}_${cacheData.xm2220.data.address}.xrunkey`;
          saveToFile_Chrome(filename, data.filedata);
          loadingOutAnimation();
          location.href = "xm2130.html";
        } else {
          document.getElementById("xm2120alert").textContent = "서버 오류";
        }
      });
    });
  });
}
function xm3010_inputAddress(eth) {
  chrome.storage.local.get("xm1100", localStorageData => {
    userBaseWalletInfo({
      address: localStorageData.xm1100.data.address,
      // id: localStorageData.xm1100.data.id,
      email: localStorageData.xm1100.data.email,
      eth,
    });
    document.getElementById("address").addEventListener("click", () => {
      var tempElem = document.createElement("textarea");
      tempElem.value = localStorageData.xm1100.data.address;
      document.body.appendChild(tempElem);
      tempElem.select();
      document.execCommand("copy");
      document.body.removeChild(tempElem);
      alert(`Success copy address "${localStorageData.xm1100.data.address}"`);
    });
  });
  document.getElementById("xm3010btn").addEventListener("click", () => {
    chrome.storage.local.get("mainnetAccount", ({ mainnetAccount }) => {
      const sendToAddress = document
        .getElementById("sendAddress")
        .value.toLowerCase();
      console.log(sendToAddress.length);
      if (sendToAddress.length >= 42) {
        chrome.storage.local.set({ xmTransferAddress: sendToAddress });
        location.href = "xm3030.html";
      } else {
        document.getElementById("xm3010alert").textContent =
          msg.xm3010.validAddress;
      }
    });
  });
  document.getElementById("xm1000flushCache").addEventListener("click", e => {
    chrome.storage.local.clear(() => {
      location.href = "xm1100.html";
    });
  });
}
function xm3030_inputBalance(eth) {
  chrome.storage.local.get("xm1100", localStorageData => {
    userBaseWalletInfo({
      address: localStorageData.xm1100.data.address,
      // id: localStorageData.xm1100.data.id,
      email: localStorageData.xm1100.data.email,
      eth,
    });
    document.getElementById("address").addEventListener("click", () => {
      var tempElem = document.createElement("textarea");
      tempElem.value = localStorageData.xm1100.data.address;
      document.body.appendChild(tempElem);
      tempElem.select();
      document.execCommand("copy");
      document.body.removeChild(tempElem);
      alert(`Success copy address "${localStorageData.xm1100.data.address}"`);
    });
  });
  document.getElementById("xm3030btn").addEventListener("click", () => {
    const value = document.getElementById("sendBalance").value;
    const memberBalanceOf = document.getElementById("xruntoken").innerText;
    document.getElementById("xm3030alert").textContent = "";
    if (isNaN(Number(value))) {
      document.getElementById("xm3030alert").textContent =
        msg.xm3030.balanceInputBox;
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
        document.getElementById("xm3030alert").textContent =
          msg.xm3030.balanceInputBoxError;
      }
    }
  });
  document.getElementById("xmTransfer").addEventListener("click", () => {
    chrome.storage.local.set({ xmTransferAddress: "" });
    location.href = "xm3010.html";
  });
  document.getElementById("xm1000flushCache").addEventListener("click", e => {
    chrome.storage.local.clear(() => {
      location.href = "xm1100.html";
    });
  });
}
function xm3050_inputpassword(eth, utils) {
  chrome.storage.local.get("xm1100", ({ xm1100 }) => {
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
              memberInfo.member = xm1100.data.member;
              memberInfo.pin = pin;
              const response = await webSocket.sendMsgToSocket([
                "xm3050",
                JSON.stringify(memberInfo),
              ]);
              if (response.code === 9102) {
                AJAXRequestMethod({
                  method: "GET",
                  requestURL: `${gatewayRemoteAddresss}?act=app4300-02-rev&member=${xm1100.data.member}&currency=11&amount=${xmTransferValue.value}&addrto=${xmTransferAddress}&memo=7603&pin=${pin}`,
                })
                  .then(data => {
                    console.log(data);
                    loadingOutAnimation();
                    location.href = "xm1000.html";
                  })
                  .catch(error => {
                    console.log(error);
                  });
              } else {
                loadingOutAnimation();
                document.getElementById("xm3050alert").textContent =
                  msg.xm3050.pinErorr;
                document.getElementById("pin").value = "";
              }
            });
          } else {
            document.getElementById("xm3050alert").textContent =
              msg.xm3050.pinEmpty;
            document.getElementById("pin").value = "";
          }
        });
      });
    });
  });
  document.getElementById("xm1000flushCache").addEventListener("click", e => {
    chrome.storage.local.clear(() => {
      location.href = "xm1100.html";
    });
  });
}
function xm3060_receipt(eth) {
  document.getElementById("home").addEventListener("click", () => {
    location.href = "xm1000.html";
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
    location.href = "xm1000.html";
  });
}

function xm5101_detailERC20TransacitonRecipt(eth) {
  const { search } = location;
  const [txHashList, valueList] = search.split("&");
  const [, txHash] = txHashList.split("=");
  const [, value] = valueList.split("=");
  getTransactionReceipt({ eth, txHash })
    .then(data => {
      document.getElementById("value").innerHTML = value;
      document.getElementById("fromAddress").innerHTML =
        "0x" + data.logs[0].topics[1].slice(26);
      document.getElementById("toAddress").innerHTML =
        "0x" + data.logs[0].topics[2].slice(26);
      document.getElementById("timestamp").innerHTML = unixToDate(
        data.timestamp
      );
    })
    .catch(error => {
      console.log(error);
    });
  document.getElementById("home").addEventListener("click", () => {
    location.href = "xm1000.html";
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
  // a.download = fileName.slice(0, fileName.length - 2);
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

const historyBlock = ({
  txHash,
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
        <input id="txHash"  hidden value="${txHash}"/>
        <input id="txHashValue"  hidden value="${value}"/>
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
  // document.getElementById("id").textContent = id;
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

function displayTag(tag, show) {
  Array(tag.length)
    .fill()
    .forEach((value, index) => {
      tag.item(index).style.display = show;
    });
}

function AJAXRequestMethod({ method, requestURL }) {
  return new Promise((res, rej) => {
    const XHR = new XMLHttpRequest();
    XHR.open(method, requestURL);
    XHR.send();
    XHR.onreadystatechange = target => {
      if (XHR.status === 200 && XHR.response.trim() !== "") {
        res(JSON.parse(XHR.response));
      }
    };
  });
}

function validAndRequestMobileCode(currentXMPage, nextXMPage, func = null) {
  let mobileCode;
  const country = document.getElementById("region").value;
  const mobile = document.getElementById("mobile").value;
  if (country.trim() === "" || mobile.trim() === "") {
    alert(msg[currentXMPage].NotInputData);
  } else {
    displayTag(
      document.getElementsByClassName(`${currentXMPage}sendbtn`),
      "none"
    );
    regionSelectData.forEach(value => {
      if (value.region === country) {
        mobileCode = value.code;
      }
    });
    displayTag(
      document.getElementsByClassName("inputMobileCodeClass"),
      "block"
    );
    displayTag(
      document.getElementsByClassName(`${currentXMPage}Verifybtn`),
      "block"
    );
    AJAXRequestMethod({
      method: "POST",
      requestURL: `${gatewayRemoteAddresss}?act=login-02&mobile=${mobile}&country=${mobileCode}`,
    })
      .then(data => {
        alert(msg[currentXMPage].sendSMSData);
        document
          .getElementById(`${currentXMPage}Verify`)
          .addEventListener("click", e => {
            e.preventDefault();
            const code = document.getElementById("mobilecode").value;
            AJAXRequestMethod({
              method: "POST",
              requestURL: `${gatewayRemoteAddresss}?act=login-03&mobile=${mobile}&code=${code}`,
            }).then(verify => {
              const { data } = verify;
              console.log("Verify");
              console.log(data);
              if (data === "login") {
                if (func !== null) {
                  func({ mobile, country });
                }
                location.href = `${nextXMPage}.html`;
              } else {
                alert(msg[currentXMPage].ErrorSendSMSData);
                displayTag(
                  document.getElementsByClassName(`${currentXMPage}ReSendbtn`),
                  "block"
                );

                document.getElementById("mobilecode").value = "";
              }
            });
          });
      })
      .catch(error => {
        console.log(error);
        document.getElementById("mobile").value = "";
        document.getElementById("region").value = "";
        alert(msg[currentXMPage].ErrorSendSMSData);
      });
  }
}
