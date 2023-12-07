// import axios from 'axios';
// import cheerio from 'cheerio';

// const getNames = async(req, res) => {
//     try {
//         const url = 'https://coinmarketcap.com/'

//         const data = await axios.get(url);

//         const Chee = cheerio.load(data.data);


//         var namesOFCurrency = []
//         for (let i = 1; i <= 20; i++){
//             console.log(i);
//             let elemSelector = `#__next > div.sc-faa5ca00-1.cKgcaj.global-layout-v2 > div.main-content > div.cmc-body-wrapper > div > div:nth-child(1) > div.sc-66133f36-2.cgmess > table > tbody > tr:nth-child(${i}) > td:nth-child(3) > div > a > div > div > div > p`

//             elemSelector = `div[class="sc-66133f36-2 cgmess"] > table  >tbody > tr:nth-child(${i}) td:nth-child(3) > div > a > div > div > div > p`

//             let p = Chee(elemSelector).text();
//             console.log(p);
//             if(p.length>0){
//                 namesOFCurrency.push(p);
//             }
//         }
//         res.send(namesOFCurrency);
//         // console.log(namesOFCurrency);

//     } catch (err) {
//         console.log("error in getNames ", err);
//     }
// }

// export default getNames;


import puppeteer from "puppeteer";


const getNames = async(req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(
      'https://coinmarketcap.com/'
    );


    await page.waitForSelector(
      'div[class="sc-66133f36-2 cgmess"] table tbody tr'
    );

    const namesOFCurrency = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        'div[class="sc-66133f36-2 cgmess"] table tbody tr'
      );

      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        let data = Array.from(columns, (column) => column.textContent.trim());
        const originalArray = data;
        const specificIndices = [2];
        const filteredArray = specificIndices.map(index => originalArray[index]);
        data= filteredArray;

        return data;
      });
    });

    
    const payload = {
      success: true,
      message: "all rows retrieved successfully",
      body: namesOFCurrency,
    }
    res.status(500).send(JSON.stringify(payload));
    await browser.close();
  } catch (err) {
    console.log("error in getNames ", err);
    const payload = {
        success: false,
        message: "error occured ",
        body: null,
      }
    res.status(400).send(JSON.stringify(payload));
  }
}

export default getNames;
