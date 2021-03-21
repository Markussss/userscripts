// ==UserScript==
// @name          Nordea Investor Improvements
// @version       1.0.0
// @grant         none
// @include       https://investor.nordea.no/*
// @downloadURL   https://cdn.jsdelivr.net/gh/Markussss/userscripts@master/nordea-investor.user.js
// @updateURL     https://cdn.jsdelivr.net/gh/Markussss/userscripts@master/nordea-investor.user.js
// ==/UserScript==

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const ignoredNames = [
  "BEAR OBX X10 NORDNET",
  "Handelsbanken Hållbar Energi",
  "JPM China A-Share Opportunities Fund",
  "JPM US Technology",
  "JP Morgan US Technology",
  "Nordea Finland Nora Fund Three",
  "Nora Fund Three (NOK)",
  "Nordea Russia",
  "East Capital Ryssland",
  "Nordea Liv Bærekraft 100 Valutasikret (B1)",
  "Nordea Liv Indeksforvaltning 100",
];

const currencyFormatter = new Intl.NumberFormat("no-NB", {
  style: "currency",
  currency: "NOK",
});

/**
 * HELPERS
 */

function addColumn(table, index, headerTitle, dataFunc) {
  const headerRow = table.querySelector("theader>tr");
  const tableRows = table.querySelectorAll("tbody>tr");
}

/**
 * FIXES
 */

function removeIgnoredNames() {
  Array.from(document.querySelectorAll("li[data-name=MYINSTRUMENTS] tr"))
    .filter((tr) =>
      ignoredNames.reduce(
        (ignore, name) => ignore || tr.textContent.includes(name),
        false
      )
    )
    .forEach((tr) => tr.remove());
}

function getRowValue(instrumentRow) {
  return parseFloat(
    instrumentRow.children[instrumentRow.children.length - 1].textContent
      .replace(/\s/g, "")
      .replace(",", "."),
    10
  );
}

function calculateNewTotal() {
  const valueRow = Array.from(
    document.querySelectorAll("li[data-name=MYINSTRUMENTS] tr")
  ).find((tr) => tr.textContent.includes("Total markedsverdi"));

  if (!valueRow) return;

  const totalValue = Array.from(
    document.querySelectorAll("li[data-name=MYINSTRUMENTS] tbody tr")
  )
    .map(getRowValue)
    .reduce((sum, value) => sum + value, 0);
  valueRow.children[
    valueRow.children.length - 1
  ].children[0].innerHTML = currencyFormatter.format(totalValue);
}

function getLatestPrice(instrumentRow) {
  const instrumentName = instrumentRow
    .querySelector(".table-naming")
    .textContent.trim();
  let latestPriceNode = Array.from(
    document.querySelectorAll("li[data-name=MY_WATCHLIST] tbody tr")
  ).find((row) => row.textContent.includes(instrumentName));

  if (latestPriceNode.querySelectorAll('[title="Realtidskurser"]').length > 0) {
    latestPriceNode = latestPriceNode.querySelectorAll(
      '[title="Realtidskurser"]'
    );
  } else {
    latestPriceNode = latestPriceNode.querySelectorAll(
      '[title="Børsen er stengt"]'
    );
  }

  if (latestPriceNode.length >= 3) {
    latestPriceNode = latestPriceNode[2].parentNode.cloneNode(true);
  } else {
    latestPriceNode = document.createElement("td");
  }

  latestPriceNode.dataset.fixed = "1";
  return latestPriceNode;
}

function addLatestPriceToInstruments() {
  const headers = document.querySelector(
    "li[data-name=MYINSTRUMENTS] tr.headers"
  );
  if (headers && headers.children.length === 7) {
    const footers = document.querySelector(
      "li[data-name=MYINSTRUMENTS] tfoot tr"
    );
    const footer = document.createElement("td");
    footers.insertBefore(footer, footers.children[1]);
    const header = document.createElement("th");
    header.innerHTML = "Siste";
    headers.insertBefore(header, headers.children[5]);
  }
  const instruments = Array.from(
    document.querySelectorAll("li[data-name=MYINSTRUMENTS] tbody tr")
  );
  instruments.forEach((instrument) => {
    const update = instrument.querySelector('[data-fixed="1"]');
    if (update) {
      update.children[0].innerHTML = getLatestPrice(instrument).textContent;
    } else {
      instrument.insertBefore(
        getLatestPrice(instrument),
        instrument.children[5]
      );
    }
  });

  // const count = getRowValue(instrumentRow) / getLatestPrice(instrumentRow);
}

function openInNewTab() {
  const links = Array.from(document.querySelectorAll("a"))
    .filter((el) => !el.dataset.linkUpdated)
    .forEach((el) => {
      el.addEventListener("auxclick", (event) => {
        if (event.button === 1) {
          el.href = window.location;
          setTimeout(() => el.click(), 0);
        }
      });
      el.dataset.linkUpdated = "1";
    });
}

function getInstrumentNameAndTicker() {
  return Array.from(
    document.querySelectorAll('[data-name="COMPANY_HIGHLIGHTS"] td')
  )
    .filter((td) => ["Ticker", "Navn"].includes(td.textContent))
    .map((td) => td.parentNode.children[1].textContent);
}

function getTicker(ticker) {
  const tickersWithDeviations = {
    ICEGR: "ICE",
    RECSI: "REC",
    SASNO: "SAS-NOK",
    AXXIS: "AGS",
    ASTK: "ASETEK",
  };
  if (tickersWithDeviations[ticker]) {
    return tickersWithDeviations[ticker];
  }
  return ticker;
}

function getName(name) {
  const namesWithDeviations = {
    vow: "scanship-holding",
    sas: "sas-ab",
    axactor: "axactor-1",
  };
  if (namesWithDeviations[name]) {
    return namesWithDeviations[name];
  }
  return name;
}

function addLinksToInstrumentDetails() {
  const links = {
    NorskBulls: ({ ticker }) =>
      `https://www.norskbulls.com/SignalPage.aspx?lang=en&Ticker=${getTicker(
        ticker
      )}.OL`,
    Shareville: ({ name }) =>
      `https://www.shareville.no/aksjer/${getName(
        name.toLowerCase().replace(/\s/g, "-")
      )}`,
  };

  if (document.querySelector("body.INSTRUMENT_DETAILS")) {
    const buttonList = document.querySelector("header.main ul");

    if (buttonList.dataset.linksAdded === "1") {
      return;
    }

    const [instrumentTicker, instrumentName] = getInstrumentNameAndTicker();

    Object.entries(links).forEach(([name, linkFunction]) => {
      const button = document.createElement("a");
      button.className = "btn btn-default";
      button.innerHTML = name;
      button.href = linkFunction({
        name: instrumentName,
        ticker: instrumentTicker,
      });
      button.target = "_blank";
      button.dataset.linkUpdated = "1";
      const li = document.createElement("li");
      li.appendChild(button);
      buttonList.appendChild(li);
      buttonList.appendChild(buttonList.children[0]);
    });
    buttonList.dataset.linksAdded = "1";
  }
}

function splitColumns() {
  const west = document.querySelector("#WEST");
  if (!west) {
    return;
  }
  const leftColumn = west.closest(".col-sm-6");
  if (!leftColumn) {
    return;
  }
  leftColumn.className = "col-sm-12";

  const rightColumn = document.querySelector("#EAST").closest(".col-sm-6");
  rightColumn.className = "col-sm-12";

  rightColumn.querySelector("ul").style.columnCount = "2";
  Array.from(rightColumn.querySelectorAll("ul#EAST>li")).forEach((li) => {
    li.style.width = "100%";
    li.style.display = "inline-block";
  });
}

function removeTempWidgetListBullet() {
  const tempWidget = document.querySelector('li[data-name="TEMP_WIDGET"]');
  if (!tempWidget) {
    return;
  }
  document.querySelector('li[data-name="TEMP_WIDGET"]').style.listStyleType =
    "none";
}

const domListener = () => {
  try {
    console.log("DOM changed!");
    removeIgnoredNames();
    calculateNewTotal();
    addLatestPriceToInstruments();
    openInNewTab();
    addLinksToInstrumentDetails();
    splitColumns();
    removeTempWidgetListBullet();
  } catch (error) {
    console.error(error);
  }
};

const domChanged = debounce(domListener, 200, false);

(() => {
  const observer = new MutationObserver(() => {
    observer.disconnect();
    domChanged();
    setTimeout(
      () =>
        observer.observe(html, {
          attributes: true,
          childList: true,
          subtree: true,
        }),
      500
    );
  });
  const html = document.querySelector("html");

  observer.observe(html, { attributes: true, childList: true, subtree: true });

  console.log("MutationObserver installed!");
})();
