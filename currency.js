(function(){
  // --- Налаштування
  var priceSelectors = ".js-store-prod-price, .t-store__card__price-value, .t-store__prod-popup__price-value";
  var apiURL = "https://open.er-api.com/v6/latest/USD";

  // --- Створюємо панель перемикача
  var container = document.createElement("div");
  container.className = "currency-switcher";
  container.innerHTML = `
    <button class="js-currency-btn" data-currency="UAH">UAH ₴</button>
    <button class="js-currency-btn" data-currency="USD">USD $</button>
    <button class="js-currency-btn" data-currency="EUR">EUR €</button>
  `;
  document.addEventListener("DOMContentLoaded", function(){
    document.body.insertBefore(container, document.body.firstChild);
  });

  var note = document.createElement("div");
  note.className = "js-rate-note";
  note.style = "margin-top:10px;font-size:14px;color:#666;";

  // --- Завантаження курсів
  function getRates(callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiURL, true);
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          try {
            var data = JSON.parse(xhr.responseText);
            callback({ USD:1, UAH:data.rates.UAH, EUR:data.rates.EUR });
          } catch(e){
            callback({ USD:1, UAH:40, EUR:0.93 });
          }
        } else {
          callback({ USD:1, UAH:40, EUR:0.93 });
        }
      }
    };
    xhr.send();
  }

  getRates(function(rates){
    var current = localStorage.getItem("currency") || "UAH";

    function format(baseUSD, currency){
      if(currency === "USD") return baseUSD.toFixed(2) + " $";
      if(currency === "EUR") return (baseUSD * rates.EUR).toFixed(2) + " €";
      return Math.round(baseUSD * rates.UAH).toLocaleString("uk-UA") + " грн";
    }

    function update(currency){
      var els = document.querySelectorAll(priceSelectors);
      for(var i=0;i<els.length;i++){
        var el = els[i];
        var base = el.getAttribute("data-base");
        if(!base){
          var raw = el.textContent.replace(/[^\d.,]/g,"").replace(",",".");
          base = parseFloat(raw) || 0;
          el.setAttribute("data-base", base);
        }
        var baseUSD = parseFloat(base);
        if(!isFinite(baseUSD)||baseUSD===0) continue;
        el.textContent = format(baseUSD, currency);
      }
      note.textContent = "Курси: 1 USD = " + rates.UAH.toFixed(2) + " грн | 1 USD = " + rates.EUR.toFixed(3) + " EUR";
      localStorage.setItem("currency", currency);
    }

    document.body.addEventListener("click", function(e){
      if(e.target.classList.contains("js-currency-btn")){
        var cur = e.target.getAttribute("data-currency");
        update(cur);
        var btns = document.querySelectorAll(".js-currency-btn");
        for(var j=0;j<btns.length;j++) btns[j].classList.remove("active");
        e.target.classList.add("active");
      }
    });

  //  var observer = new MutationObserver(function(){
  //    update(localStorage.getItem("currency") || current);
  //  });
  //  observer.observe(document.body, { childList:true, subtree:true });

    document.body.insertBefore(note, container.nextSibling);
    update(current);
    var active = document.querySelector('[data-currency="'+current+'"]');
    if(active) active.classList.add("active");
  });

  // --- Стилі
  var style = document.createElement("style");
  style.textContent = `
    .currency-switcher { margin-bottom:15px; text-align:center; }
    .js-currency-btn {
      margin-right:8px; padding:6px 10px; cursor:pointer;
      border:1px solid #ccc; background:#f8f8f8; border-radius:4px;
      transition:all .2s ease;
    }
    .js-currency-btn.active{background:#333;color:#fff;}
    .js-currency-btn:hover{background:#ddd;}
  `;
  document.head.appendChild(style);
})();
