let structure = {
    "productId": "",
    "title": "",
    "slug": "",
    "description": "",
    "finalAvatar": "",
    "category": "",
    "tags": "",
    "offer": "",
    "ownerName": "",
    "ownerAvatar": "",
    "rating": "",
    "totalReviews": "",
    "ingressDate": "",
    "optionsPayment": "",
    "totalClasses": "",
    "totalHours": "",
    "community": "",
    "hasCommunity": "",
    "topification": "",
    "topic": ""
};
let dataSetPrice = [];
let dataSetProduct = [];
let productId = 1;
let productScore = 100000;
let total = 0;
let maxPages = 5;
document.getElementById('myBar').setAttribute('hidden', true);

document.getElementById('logList').addEventListener('DOMSubtreeModified', event => {
    document.getElementById('logList').scrollTop = document.getElementById('logList').scrollHeight;
})

document.getElementById('runProcessSearch').addEventListener('click', (event) => {
    let term = document.getElementById('termSearch').value;
    let page = 1;
    let temp = setInterval(function(){
        fetchData(term, page, productId, productScore).then(response => {
            document.getElementById('runProcessSearch').setAttribute('hidden', true);
            document.getElementById('myBar').removeAttribute('hidden');
            document.getElementById('myBar').style.width = Math.ceil((1-maxPages/page)*100) + '%';
            if (page < maxPages) {
                productId = response.results[23].searchAfter[1];
                productScore = response.results[23].searchAfter[0];
                response.results.map(item => {
                    document.getElementById('logList').innerHTML += '<p>[' + item.productId + '] ' + item.title + '</p>';
                    item.tags = item.tags.join('","').replaceAll('"', '');
                    dataSetProduct.push([
                        item.productId,
                        item.title,
                        item.slug,
                        clearText(item.description),
                        item.category,
                        item.tags,
                        item.ownerName,
                        Math.round(item.rating, 1),
                        item.totalReviews,
                        item.ingressDate.split('T')[0],
                        item.totalClasses,
                        item.totalHours,
                        item.hasCommunity]);
                    fetchPriceData(item.productId).then(result => {
                        dataSetPrice.push(result);
                    })
                })
                page++;
            } else {
                download('produtos', dataSetProduct);
                // download('precos', dataSetPrice);
                clearInterval(temp);
                return false;
            }
        });
    }, 1000);
});

async function fetchData(termSearch, page, pId, pScore){
    const response = await fetch('https://api-display-search.hotmart.com/api/v2/product/search?searchText=' + encodeURI(termSearch) + '&size=24&searchAfterScore=' +  pScore + '&searchAfterProductId=' +  pId + '&limit=24&offset=' +  page + '&isoLanguage=pt-br', { method: 'GET' });
    return await response.json();
}

async function fetchPriceData(pId){
    const response = await fetch("https://api-hotmart-async-checkout.hotmart.com/hotmart-checkout/api/v1/checkoutPrice/loadByProduct", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,nl;q=0.5,fr;q=0.4,mt;q=0.3,da;q=0.2,und;q=0.1,zh-CN;q=0.1,zh;q=0.1",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://hotmart.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"affiliationReference\":[{\"productId\":" +  pId + ",\"couponOfferCode\":\"\",\"orderOfferCode\":\"bo5nppm7\"}],\"attach_token\":false,\"productId\":" +  pId + "}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });

    return await response.json();
}

function clearText(text){
    let tmp = document.implementation.createHTMLDocument("New").body;
    tmp.innerHTML = text;
    return tmp.innerText.replaceAll(/[^\x00-\x7F]/g, "").replaceAll(/(\r\n|\n|\r)/gm, "").replaceAll(",", "").replaceAll(";", "");
}

function download(name = 'produtos', data) {
    let csvContent = "";

    data.map(line => {
        csvContent += JSON.stringify(line).replaceAll('[', '').replaceAll(']', '') + "\r\n";
    });

    var file = new Blob([csvContent], {type: 'csv'});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, name + '.csv');
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = name + '.csv';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}