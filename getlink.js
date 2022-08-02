let elements = document.getElementsByTagName('a');

let links = [];

for (let element of elements) {
    if (element.getAttribute('href') && element.getAttribute('href').includes('/ca-si/')) {
        links.push({
            link: 'https://chiasenhac.vn' + element.getAttribute('href'),
            target_type: 'singer'
        });
    } else if (element.getAttribute('href') && element.getAttribute('href').includes('filter=ca-si')) {
        links.push({
            link: element.getAttribute('href'),
            target_type: 'singer_search'
        });
    }
}

let unique = {};

for (let link of links) {
    unique[link.link] = link;
}

console.log(Object.values(unique));