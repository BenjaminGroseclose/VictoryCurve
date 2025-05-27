const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");

ipcMain.handle("save-file", (ev, options) => {});

ipcMain.handle("read-json-file", (ev, filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");

    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read file:", err);
    throw err;
  }
});

function createWindow() {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/victory-curve/browser/index.html`),
      protocol: "file:",
      slashes: true,
    })
  );
  // Open the DevTools.
  window.webContents.openDevTools();

  window.on("closed", function () {
    window = null;
  });
}

app.commandLine.appendSwitch("ignore-certificate-errors");
app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
