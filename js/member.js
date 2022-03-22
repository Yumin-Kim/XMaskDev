createWeb3(mainnetIP)
  .then(web3 => {
    const { eth } = web3;
    let { pathname } = location;
    console.log(pathname);
    [pathname] = pathname.slice(1).split(".");
    switch (pathname) {
      case "xm2210": {
        console.log("asdasdasd");
        return signupFunction(eth);
      }
      default:
        return "Error";
    }
  })
  .catch(() => {});
function signupFunction() {
  document
    .getElementById("loginSubmit")
    .addEventListener("click", function (e) {
      e.preventDefault();
      const id = document.getElementById("id").value;
      const pin = document.getElementById("pin").value;
      if (id.trim() === "" || pin.trim() === "") {
        alert("아이디 비밀번호 입력 필요");
        return;
      } else {
        console.log(id, pin);
        const webSocket = new NetworkTryObj("108.136.46.103", "5001");
        webSocket.webSocketInit(async socket => {
          const data = await webSocket.sendMsgToSocket([
            "signup",
            JSON.stringify({ a: "asedaa" }),
          ]);
          console.log(data);
        });
      }
    });
}
