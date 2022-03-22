const webSocket = new NetworkTryObj("108.136.46.103", "5001");

createWeb3(mainnetIP)
  .then(web3 => {
    const { eth } = web3;
    let { pathname } = location;
    console.log(pathname);
    [pathname] = pathname.slice(1).split(".");
    switch (pathname) {
      case "xm2210": {
        return xm2210_signupFunction(eth);
      }
      case "xm2220": {
        return xm2220_AuthEmailFunction();
      }
      default:
        return "Error";
    }
  })
  .catch(() => {});
function xm2210_signupFunction() {
  document
    .getElementById("loginSubmit")
    .addEventListener("click", function (e) {
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
        console.log(id, pin);
        webSocket.webSocketInit(async socket => {
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
      const { email } = result.xm2210.data;
      document.getElementById("memberemail").textContent = email;

      document.getElementById("sendEmail").addEventListener("click", e => {
        e.preventDefault();
        if (count === 1) {
          //소켓 초기화
          webSocket.webSocketInit(async socket => {
            const memberInfo = {};
            memberInfo.id = id;
            memberInfo.pin = pin;
            memberInfo.email = email;
            memberInfo.phonenumber = phonenumber;
            const data = await webSocket.sendMsgToSocket([
              "xm2220",
              JSON.stringify(memberInfo),
            ]);
            if (data.code === 9102) {
              chrome.storage.local.set({ xm2210: data });
              location.href = "xm2220.html";
            }
          });
        } else if (count === 0) {
          document.getElementById("sendEmail").value = "Authorization";
          webSocket.webSocketInit(async socket => {
            const memberInfo = {};
            memberInfo.member = pin;
            memberInfo.email = email;
            const data = await webSocket.sendMsgToSocket([
              "xm2220",
              JSON.stringify(memberInfo),
            ]);
            if (data.code === 9102) {
              chrome.storage.local.set({ xm2210: data });
              location.href = "xm2220.html";
            }
          });
        } else {
        }
        count++;
      });
    }
  });
}
