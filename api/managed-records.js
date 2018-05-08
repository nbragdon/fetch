import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const PRIMARY_COLORS = {
    red: true,
    blue: true,
    yellow: true
};
const MAX_ITEMS_PER_PAGE = 10;
const MAX_NUMBER_OF_PAGES = 50;
const OPEN_DISPOSITION = 'open';
const CLOSED_DISPOSITION = 'closed';
const VALID_STATUS_CODE = 200;

function fetchResults(pageNumber, colors) {
    const requestUri = URI(window.path)
        .addSearch('limit', MAX_ITEMS_PER_PAGE)
        .addSearch('offset', (pageNumber - 1) * MAX_ITEMS_PER_PAGE)
        .addSearch('color[]', colors);

    return fetch(requestUri)
        .then(response => response.json())
        .catch(err => {
            console.log('Invalid Response fetching records', err);
            return [];
        })
        .then((response) => {
            return response;
        });
}

function transformResult(transformedData, result) {
    transformedData.ids.push(result.id);

    result.isPrimary = (PRIMARY_COLORS[result.color]) ? true : false;

    if (result.disposition == OPEN_DISPOSITION) {
        transformedData.open.push(result);
    }

    if (result.disposition == CLOSED_DISPOSITION && result.isPrimary) {
        transformedData.closedPrimaryCount++;
    }
}

function retrieve({ page = 1, colors = [] } = {}) {
    //use fetch API to get the results
    return fetchResults(page, colors)
        .then((results) => {
            let transformedData = {
                ids: [],
                open: [],
                closedPrimaryCount: 0,
                previousPage: ((page - 1) < 1) ? null : (page - 1),
                nextPage: (page >= MAX_NUMBER_OF_PAGES || results.length == 0) ? null : page + 1,
            };

            results.map((result) => {
                transformResult(transformedData, result);
            });

            return transformedData;
        });
}

export default retrieve;
