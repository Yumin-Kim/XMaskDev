// 설치 시 동작
chrome.runtime.onInstalled.addListener(({ reason, version }) => {
  console.log("Hello", chrome.runtime.OnInstalledReason);
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: "xm2000.html" });
  }
});
chrome.runtime.onMessage.addListener((msg, sender, res) => {
  console.log("Hello   onMessage");
  console.log(msg, sender, res);
  if (msg.command == "Test") {
    alert("Success");
  }
});
chrome.storage.local.set({ Code: "asd" }, function () {
  console.log("Value is set to " + value);
});
(async () => {
  let queryOptions = { active: true, currentWindow: true };
  let tab = await chrome.tabs.query(queryOptions);
  console.log(tab);
})();
