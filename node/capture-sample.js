const fs = require('fs');
const { promisify } = require('util');
const webdriver = require('selenium-webdriver');
const { Builder, By, until } = webdriver;

const capabilities = webdriver.Capabilities.chrome();
capabilities.set('chromeOptions', {
    args: [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        `--window-size=1980,1200`
    ]
});

// awaitを使うので、asyncで囲む
(async () => {

    // ブラウザ立ち上げ
    const driver = await new Builder().withCapabilities(capabilities).build();

    // Youtubeへ移動
    await driver.get('https://www.youtube.com/');

    // 検索ボックスが表示されるまで待つ
    await driver.wait(until.elementLocated(By.id('search')), 10000);

    let base64 = await driver.takeScreenshot();
    let buffer = Buffer.from(base64, 'base64');

    // bufferを保存
    await promisify(fs.writeFile)('screenshot.jpg', buffer);

    // ブラウザ終了
    driver.quit();

})();
