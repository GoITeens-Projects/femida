const axios = require("axios");
const NodeCache = require("node-cache");

const urlsCache = new NodeCache({ stdTTL: 300 });

class Phishing {
  #urlShorteners = [
    "bit.ly",
    "tinyurl.com",
    "short.link",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "adf.ly",
    "bl.ink",
    "surl.li",
    "link.infini.fr",
  ];

  async #urlShortenerCheck(domain) {
    const isInUrlShorteners = this.#urlShorteners.some(
      (urlShortener) => urlShortener === domain
    );
    if (isInUrlShorteners) {
      return {
        passed: false,
        message: "Використання скорочувача посилань",
        systemMessage: "URL Shortener",
      };
    }
    const { data } = await axios.get(
      "https://raw.githubusercontent.com/PeterDaveHello/url-shorteners/master/list"
    );
    const domains = data.split(/\r?\n/).filter((line) => line.trim());
    domains.splice(0, 10);
    const isInExternalUrlShortener = domains.some((d) => d === domain);
    if (isInExternalUrlShortener) {
      return {
        passed: false,
        message: "Використання скорочувача посилань (Advanced)",
        systemMessage: "External URL Shortener",
      };
    }
    return {
      passed: true,
      message: "",
      systemMessage: "",
    };
  }

  #googleSafeBrowsingCheck(url) {
    return axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_KEY}`,
      {
        client: {
          clientId: "Femida",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [
            {
              url,
            },
          ],
        },
      }
    );
  }

  #phishTankCheck(url) {
    return axios.post(
      "https://checkurl.phishtank.com/checkurl/",
      {
        url,
        format: "json",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": `phishtank/${process.env.PHISHTANK_USER_AGENT}`,
        },
      }
    );
  }
  async isPhishingUrl(url) {
    if (urlsCache.get(url)) {
      const result = { ...urlsCache.get(url), cached: true };
      return result;
    }
    let mainRes = {};
    phishCheck: try {
      const u = new URL(url);
      const urlShortenerResult = await this.#urlShortenerCheck(u.hostname);
      if (!urlShortenerResult.passed) {
        mainRes = urlShortenerResult;
        break phishCheck;
      }
      const results = await Promise.all([
        this.#googleSafeBrowsingCheck(url),
        this.#phishTankCheck(url),
      ]);
        if (results[0].data && results[0].data?.matches) {
          mainRes = {
            passed: false,
            message: "Відправлене посилання є небезпечним (Google Safe Browsing)",
            systemMessage: "Google Safe Browsing Alert",
          };
          break phishCheck;
        }
      if (results[1].data.results) {
        if (results[1].data.results?.valid) {
          mainRes = {
            passed: false,
            message: "Відправлене посилання є небезпечним (PhishTank)",
            systemMessage: "PhishTank Alert",
          };
          break phishCheck;
        }
      }
      mainRes = {
        passed: true,
        message: "",
        systemMessage: "",
      };
    } catch (error) {
      console.log(error);
      mainRes = {
        passed: false,
        message: "Загальне спрацювання при спробі перевірити посилання",
        systemMessage: "Manual error (in catch block)",
      };
    } finally {
      if (Object.keys(mainRes).length !== 0) urlsCache.set(url, mainRes);
      return mainRes;
    }
  }
}

module.exports = new Phishing();
