const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.get('/search', async (req, res) => {
  const searchMusic = req.query.music;

  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  const pageUrl = `https://www.youtube.com/results?search_query=${searchMusic}&sp=EgIQAQ%253D%253D`;
  await page.goto(pageUrl);

  const IdMusic = await page.evaluate(() => {
    const ytdVideoRendererList = document.querySelectorAll('ytd-video-renderer')
    const hrefArray = [];

    ytdVideoRendererList.forEach(ytdVideoRenderer => {
      const videoTitleElement = ytdVideoRenderer.querySelector('#video-title');
      const videoTitle = ytdVideoRenderer.querySelector('#video-title').querySelector('yt-formatted-string').__shady_native_innerHTML
      const videoChannel_Name = ytdVideoRenderer.querySelector('.yt-simple-endpoint.style-scope.yt-formatted-string').__shady_native_innerHTML
      
      if (videoTitleElement) {
        const hrefValue = videoTitleElement.getAttribute('href');
        const regex = /\/watch\?v=(.*?)&pp=/;
        const match = hrefValue.match(regex);

        if (match) {
          const extractedValue = match[1];
          const videoInfo = {
            id: extractedValue,
            name: videoTitle,
            channel_name: videoChannel_Name,
          };
          hrefArray.push(videoInfo);
        } else {
          console.log("Nenhum valor encontrado na string");
        }
      }
    });
    return hrefArray.slice(0, 8);
  });
  page.on('console', (msg) => console.log('LOG DA PÁGINA:', msg.text()));

  res.send(IdMusic)
  await browser.close();
})