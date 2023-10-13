require('dotenv').config();
const puppeteer = require('puppeteer');
const { WebClient } = require('@slack/web-api');

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const LOGIN_URL = process.env.LOGIN_URL;
const TIME_TRACKING_URL = process.env.TIME_TRACKING_URL;

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function checkHours() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(LOGIN_URL);
    await page.type('#email', EMAIL);
    await page.type('#password', PASSWORD);
    await page.click('.login-btn');
    await page.waitForNavigation();
    await page.goto(TIME_TRACKING_URL);
    await page.waitForSelector('#hours');
    await delay(5000);
    const screenshot = await page.screenshot({ path: 'timesheet.png', fullPage: true });
    // sendToSlack(screenshot);
    await browser.close();
    
}

async function sendToSlack(image) {
    const web = new WebClient(SLACK_TOKEN);
    await web.files.upload({
        channels: CHANNEL_ID,
        file: image,
        filename: 'timesheet.png',
        filetype: 'png',
        title: 'Today\'s Timesheet'
    });
}

checkHours();
