import puppeteer from "puppeteer";

const scrapeSharePage = async (url: string) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector("#MainContentScrollpane", { timeout: 1000 });

    const body = await page.evaluate(() => {
      return document.querySelector("body")?.innerHTML;
    });
    console.log(body);

    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

scrapeSharePage("https://share.descript.com/view/MOzBLM91k3G");
