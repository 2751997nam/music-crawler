let elements = document.getElementsByTagName('a');

let links = [];

for (let element of elements) {
    if (element.getAttribute('href') && element.getAttribute('href').includes('/ca-si/')) {
        links.push('https://chiasenhac.vn' + element.getAttribute('href'));
    }
}

let unique = {};

for (let link of links) {
    unique[link] = 1;
}

console.log(Object.keys(unique));