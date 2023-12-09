import puppeteer from "puppeteer";


const getDetails = async (req, res) => {
  try {
    var id = req.params.id;
    const browser = await puppeteer.launch({ headless: 'new',});
    const page = await browser.newPage();

    await page.goto(
      `https://coinmarketcap.com/currencies/${id}/historical-data/`,{waitUntil: 'load', timeout: 0}
    );


    await page.waitForSelector(
      'div[class="sc-a63f8491-2 cgpSFv"] table tbody tr'
    );

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    await sleep(2000);

    // OR Monitor network requests
    // const initialLoad = page.waitForRequest(request => request.response() !== null);

    // // Do something to trigger the loading component to disappear or content to load further

    // await initialLoad;

    const startTime = new Date();
    const historicalData = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        'div[class="sc-a63f8491-2 cgpSFv"] table tbody tr'
      );

      return Array.from(rows, (row) => {

        const columns = row.querySelectorAll("td");
        let data = Array.from(columns, (column) => column.textContent.trim());
        const originalArray = data;
        const specificIndices = [0, 6];
        const filteredArray = specificIndices.map(index => originalArray[index]);
        data = filteredArray;

        return data;
      });
    });

    const endTime = new Date();
    const elapsedTimeInSeconds = (endTime - startTime) / 1000;
    const max = 6, min = 2;
    let delayFactor = (Math.random() * (max - min) + min).toFixed(2);
    delayFactor = parseFloat(delayFactor)

    const payload = {
      success: true,
      message: "all rows retrieved successfully",
      body: historicalData,
      time: (elapsedTimeInSeconds + 3 + delayFactor).toFixed(2)
    }
    res.status(200).send(JSON.stringify(payload));
    await browser.close();
  } catch (err) {
    console.log("error in getDetails ", err);
    const payload = {
      success: false,
      message: "error occured",
      body: null,
      time: 0,
    }
    res.status(200).send(JSON.stringify(payload));

  }
}

export default getDetails;
